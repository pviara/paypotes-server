import { Module } from '@nestjs/common';
import { RabbitMQConsumer } from '@infra/rabbitmq/rabbitmq.consumer';
import {
    rabbitMQProducerProvider,
    rabbitMQProducerToken,
} from '@infra/rabbitmq/rabbitmq.producer.provider';
import { rabbitMQServiceProvider } from '@infra/rabbitmq/rabbitmq.service.provider';

@Module({
    exports: [rabbitMQProducerToken],
    providers: [rabbitMQProducerProvider, rabbitMQServiceProvider],
})
export class RabbitMQModule {}
