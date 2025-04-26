import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DefaultRabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { setTimeout } from 'node:timers/promises';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    private logger = new Logger(RabbitMQConsumer.name);

    constructor(private service: DefaultRabbitMQService) {}

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
