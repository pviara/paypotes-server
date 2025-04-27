import { Module } from '@nestjs/common';
import {
    rabbitMQProducerProvider,
    rabbitMQProducerToken,
} from '@infra/rabbitmq/rabbitmq.producer.provider';
import { rabbitMQServiceProvider } from '@infra/rabbitmq/rabbitmq.service.provider';
import { RabbitMQConsumer } from './rabbitmq.consumer';

@Module({
    exports: [rabbitMQProducerToken],
    providers: [
        RabbitMQConsumer,
        rabbitMQProducerProvider,
        rabbitMQServiceProvider,
    ],
})
export class RabbitMQModule {}
