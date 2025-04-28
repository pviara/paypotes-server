import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';
import { ConfigService } from '@nestjs/config';

export class RabbitMQContactTaskRecipient implements OnApplicationBootstrap {
    private logger = new Logger(RabbitMQContactTaskRecipient.name);

    readonly queue = this.configService.get<string>('CONTACT_TASKS_QUEUE', '');

    constructor(
        private configService: ConfigService,

        @Inject(rabbitMQServiceToken)
        private service: RabbitMQService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        this.logger.log(`Consuming queue ${this.queue}`);

        const consumer = this.service.getConsumer();
        consumer.assertQueue(this.queue);
        await consumer.consume(this.queue, (message) =>
            console.log(message?.content.toString()),
        );
    }
}
