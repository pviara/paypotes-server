import {
    MessageProducer,
    SendingOptions,
} from '@infra/rabbitmq/rabbitmq.producer';
import { Spy } from '@test/helpers/spy';

export class RabbitMQProducerSpy
    extends Spy<MessageProducer>
    implements MessageProducer
{
    readonly calls = {
        send: {
            count: 0,
            history: [] as Array<SendingOptions>,
        },
    };

    async send(options: SendingOptions): Promise<void> {
        this.saveCall('send', options);
        return this.getStubOrDefault('send', undefined);
    }
}
