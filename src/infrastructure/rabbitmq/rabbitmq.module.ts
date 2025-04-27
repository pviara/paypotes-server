import { Module } from '@nestjs/common';
import { rabbitMQContactTasksConsumerProvider } from '@infra/rabbitmq/rabbitmq.consumer.providers';
import {
    rabbitMQProducerProvider,
    rabbitMQProducerToken,
} from '@infra/rabbitmq/rabbitmq.producer.provider';
import { rabbitMQServiceProvider } from '@infra/rabbitmq/rabbitmq.service.provider';

@Module({
    exports: [rabbitMQProducerToken],
    providers: [
        rabbitMQContactTasksConsumerProvider,
        rabbitMQProducerProvider,
        rabbitMQServiceProvider,
    ],
})
export class RabbitMQModule {}
