import { DefaultRabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    constructor(
        @Inject(rabbitMQServiceToken)
        private service: DefaultRabbitMQService,
    ) {}

    async onModuleInit(): Promise<void> {
        // todo: works with a setTimeout
        // const queue = 'contact_tasks';
        // const consumer = this.service.getConsumer();
        // consumer.assertQueue(queue);
        // await consumer.consume(queue, (message) =>
        //     console.log(message?.content.toString()),
        // );
    }
}
