import { DefaultRabbitMQService } from '@infra/rabbitmq/rabbitmq.service';

export type SendingOptions = { queue: string; message: unknown };

export interface Producer {
    send(options: SendingOptions): Promise<void>;
}

export class RabbitMQProducer implements Producer {
    constructor(private service: DefaultRabbitMQService) {}

    send(options: SendingOptions): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
