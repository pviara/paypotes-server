import { Channel } from 'amqplib';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { Spy } from '@test/helpers/spy';

export class RabbitMQServiceSpy
    extends Spy<RabbitMQService>
    implements RabbitMQService
{
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
        return this.getStubOrDefault('getConsumer', {} as Channel);
    }

    getProducer(): Channel {
        this.saveCall('getProducer', null);
        return this.getStubOrDefault('getProducer', {} as Channel);
    }
}
