import {
    MessageProducer,
    RabbitMQProducer,
} from '@infra/messaging/rabbitmq.producer';
import { Provider } from '@nestjs/common';

export const rabbitMQProducerProvider: Provider = {
    provide: MessageProducer,
    useClass: RabbitMQProducer,
};
