import { ConfigService } from '@nestjs/config';
import { ContactTaskHandler } from '@app/infrastructure/contact-task-handlers/contact.task-handler';
import { contactTaskHandlerToken } from '@app/infrastructure/contact-task-handlers/contact.task-handler.provider';
import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { MessageContent } from '@infra/contact-task-managers/message-content';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';
import { ConsumeMessage } from 'amqplib';
import { Nullable } from '@test/helpers/application-runner/model/nullable';

export class RabbitMQContactTaskRecipient implements OnApplicationBootstrap {
    private logger = new Logger(RabbitMQContactTaskRecipient.name);

    readonly queue = this.configService.get<string>('CONTACT_TASKS_QUEUE', '');

    constructor(
        private configService: ConfigService,

        @Inject(rabbitMQServiceToken)
        private service: RabbitMQService,

        @Inject(contactTaskHandlerToken)
        private handler: ContactTaskHandler,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        this.logger.log(`Consuming queue ${this.queue}`);

        const consumer = this.service.getConsumer();
        consumer.assertQueue(this.queue);
        await consumer.consume(this.queue, (message) => {
            const messageContent = this.parse(message);
            if (this.isMessageContent(messageContent)) {
                return this.handler.on(messageContent);
            }
        });
    }

    private parse(message: Nullable<ConsumeMessage>): unknown {
        return JSON.parse(message?.content.toString() ?? '');
    }

    private isMessageContent(content: unknown): content is MessageContent {
        return !!content && typeof content === 'object' && 'type' in content;
    }
}
