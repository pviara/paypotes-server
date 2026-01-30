import { MessageBroker } from '@infra/messaging/rabbitmq.message-broker';
import { MessageContent } from '@infra/contact-task-management/message-content';
import { Injectable } from '@nestjs/common';

export type SendingOptions = { queue: string; message: MessageContent };

export abstract class MessageProducer {
    abstract send(options: SendingOptions): Promise<void>;
}

@Injectable()
export class RabbitMQProducer implements MessageProducer {
    constructor(private service: MessageBroker) {}

    async send({ queue, message }: SendingOptions): Promise<void> {
        await this.service.getProducer().assertQueue(queue);
        this.service
            .getProducer()
            .sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }
}
