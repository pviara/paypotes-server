import {
    MessageProducer,
    RabbitMQProducer,
} from '@infra/rabbitmq/rabbitmq.producer';
import { Provider } from '@nestjs/common';

export const rabbitMQProducerProvider: Provider = {
    provide: MessageProducer,
    useClass: RabbitMQProducer,
};
