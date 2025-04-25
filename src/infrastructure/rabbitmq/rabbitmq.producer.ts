import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { setTimeout } from 'node:timers/promises';

@Injectable()
export class RabbitMQProducer implements OnModuleInit {
    private logger = new Logger(RabbitMQProducer.name);

    constructor(private service: RabbitMQService) {}

    async onModuleInit(): Promise<void> {
        await setTimeout(2000);

        const queue = 'tasks';
        this.service.getProducer().assertQueue(queue);
        this.service
            .getProducer()
            .sendToQueue(queue, Buffer.from('hello world'));
    }
}
