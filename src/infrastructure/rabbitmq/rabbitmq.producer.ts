import { MessageContent } from '@infra/contact-task-managers/message-content';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';

export type SendingOptions = { queue: string; message: MessageContent };

export abstract class Producer {
    abstract send(options: SendingOptions): Promise<void>;
}

export class RabbitMQProducer implements Producer {
    constructor(private service: RabbitMQService) {}

    async send({ queue, message }: SendingOptions): Promise<void> {
        await this.service.getProducer().assertQueue(queue);
        this.service
            .getProducer()
            .sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }
}
