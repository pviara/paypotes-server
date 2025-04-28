import { ConfigService } from '@nestjs/config';
import { ContactTaskHandler } from '@app/infrastructure/contact-task-handlers/contact.task-handler';
import { contactTaskHandlerToken } from '@app/infrastructure/contact-task-handlers/contact.task-handler.provider';
import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

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
        consumer.consume(this.queue, (message) => {
            if (!message) return;
            return this.handler.on(message?.content.toString());
        });
    }
}
