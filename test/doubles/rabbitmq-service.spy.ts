import { Channel } from 'amqplib';
import { MessageBrokerService } from '@infra/rabbitmq/rabbitmq.service';
import { Spy } from '@test/helpers/spy';

export class RabbitMQServiceSpy
    extends Spy<MessageBrokerService>
    implements MessageBrokerService
{
    private readonly DEFAULT_CHANNEL = {
        assertQueue: async () => {},
        sendToQueue: () => {},
        consume: () => {},
    } as unknown as Channel;

    readonly calls = {
        getConsumer: {
            count: 0,
            history: [],
        },
        getProducer: {
            count: 0,
            history: [],
        },
    };

    getConsumer(): Channel {
        this.saveCall('getConsumer', null);
        return this.getStubOrDefault('getConsumer', this.DEFAULT_CHANNEL);
    }

    getProducer(): Channel {
        this.saveCall('getProducer', null);
        return this.getStubOrDefault('getProducer', this.DEFAULT_CHANNEL);
    }
}
