import { Inject } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export type SendingOptions = { queue: string; message: unknown };

export interface Producer {
    send(options: SendingOptions): Promise<void>;
}

export class RabbitMQProducer implements Producer {
    constructor(
        @Inject(rabbitMQServiceToken)
        private service: RabbitMQService,
    ) {}

    async send({ queue, message }: SendingOptions): Promise<void> {
        await this.service.getProducer().assertQueue(queue);
        this.service
            .getProducer()
            .sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }
}
