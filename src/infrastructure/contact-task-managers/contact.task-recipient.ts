import { AsyncLocalStorage } from 'async_hooks';
import { Channel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { ContactTaskHandler } from '@infra/contact-task-handlers/contact.task-handler';
import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { MessageContent } from '@infra/contact-task-managers/message-content';
import { Nullable } from '@app/shared/nullable';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';
import { Store } from '@infra/async-local-storage/store';

export class RabbitMQContactTaskRecipient implements OnApplicationBootstrap {
    readonly queue = this.configService.get<string>('CONTACT_TASKS_QUEUE', '');

    constructor(
        private als: AsyncLocalStorage<Store>,
        private configService: ConfigService,

        @Inject(rabbitMQServiceToken)
        private service: RabbitMQService,

        private handler: ContactTaskHandler,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const consumer = this.service.getConsumer();
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
