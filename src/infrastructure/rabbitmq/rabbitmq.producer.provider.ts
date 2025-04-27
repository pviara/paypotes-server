import { Provider } from '@nestjs/common';
import { RabbitMQProducer } from '@infra/rabbitmq/rabbitmq.producer';

export const rabbitMQProducerToken = 'RabbitMQProducer';
export const rabbitMQProducerProvider: Provider = {
    provide: rabbitMQProducerToken,
    useClass: RabbitMQProducer,
};
