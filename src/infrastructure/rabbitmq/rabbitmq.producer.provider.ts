import { Producer, RabbitMQProducer } from '@infra/rabbitmq/rabbitmq.producer';
import { Provider } from '@nestjs/common';

export const rabbitMQProducerProvider: Provider = {
    provide: Producer,
    useClass: RabbitMQProducer,
};
