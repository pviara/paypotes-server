import { Module } from '@nestjs/common';
import {
    rabbitMQProducerProvider,
    rabbitMQProducerToken,
} from '@infra/rabbitmq/rabbitmq.producer.provider';
import {
    rabbitMQServiceProvider,
    rabbitMQServiceToken,
} from '@infra/rabbitmq/rabbitmq.service.provider';

@Module({
    exports: [rabbitMQProducerToken, rabbitMQServiceToken],
    providers: [rabbitMQProducerProvider, rabbitMQServiceProvider],
})
export class RabbitMQModule {}
