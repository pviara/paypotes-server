import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { setTimeout } from 'node:timers/promises';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    private logger = new Logger(RabbitMQConsumer.name);

    constructor(private service: RabbitMQService) {}

    async onModuleInit(): Promise<void> {
        await setTimeout(1000);

        const queue = 'tasks';
        this.service.getConsumer().assertQueue(queue);
        this.service
            .getConsumer()
            .consume(queue, (message) =>
                console.log('received task!', message?.content.toString()),
            );
    }
}
