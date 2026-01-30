import { AsyncLocalStorage } from 'async_hooks';
import { Channel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { ContactTaskHandler } from '@infra/contact-task-handlers/contact.task-handler';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MessageContent } from '@infra/contact-task-management/message-content';
import { Nullable } from '@app/shared/nullable';
import { MessageBroker } from '@infra/messaging/rabbitmq.message-broker';
import { Store } from '@infra/async-local-storage/store';

export abstract class ContactTaskConsumer implements OnApplicationBootstrap {
    abstract onApplicationBootstrap(): Promise<void>;
}

@Injectable()
export class DefaultContactTaskConsumer
    implements OnApplicationBootstrap, ContactTaskConsumer
{
    readonly queue = this.configService.getOrThrow<string>(
        'CONTACT_TASKS_QUEUE',
    );

    constructor(
        private als: AsyncLocalStorage<Store>,
        private configService: ConfigService,
        private broker: MessageBroker,
        private handler: ContactTaskHandler,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const consumer = this.broker.getConsumer();
        consumer.assertQueue(this.queue);
        consumer.consume(this.queue, (message) =>
            this.attemptHandling(message, consumer),
        );
    }

    private async attemptHandling(
        message: Nullable<ConsumeMessage>,
        consumer: Channel,
    ): Promise<void> {
        if (!message) return;

        try {
            const messageContent = this.parse(message);
            if (!this.isMessageContent(messageContent)) return;

            const store = { 'x-correlation-id': messageContent.correlationId };
            await this.als.run(store, () => this.handler.on(messageContent));

            consumer.ack(message);
        } catch (error: unknown) {}
    }

    private parse(message: Nullable<ConsumeMessage>): unknown {
        return JSON.parse(message?.content.toString() ?? '');
    }

    private isMessageContent(content: unknown): content is MessageContent {
        return (
            !!content &&
            typeof content === 'object' &&
            'type' in content &&
            'correlationId' in content
        );
    }
}
