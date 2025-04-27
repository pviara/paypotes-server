import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export type ConsumerOptions = { queue: string };

export class RabbitMQConsumer implements OnApplicationBootstrap {
    private logger = new Logger(RabbitMQConsumer.name);

    constructor(
        private options: ConsumerOptions,

        @Inject(rabbitMQServiceToken)
        private service: RabbitMQService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const { queue } = this.options;
        this.logger.log(`Consuming queue ${queue}`);

        const consumer = this.service.getConsumer();
        consumer.assertQueue(queue);
        await consumer.consume(queue, (message) =>
            console.log(message?.content.toString()),
        );
    }
}
