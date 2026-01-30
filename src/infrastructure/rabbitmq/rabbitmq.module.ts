import { MessageBroker } from '@app/infrastructure/rabbitmq/rabbitmq.message-broker';
import { MessageProducer } from '@infra/rabbitmq/rabbitmq.producer';
import { Module } from '@nestjs/common';
import { rabbitMQProducerProvider } from '@infra/rabbitmq/rabbitmq.producer.provider';
import { rabbitMQServiceProvider } from '@app/infrastructure/rabbitmq/rabbitmq.message-broker.provider';

@Module({
    exports: [MessageBroker, MessageProducer],
    providers: [rabbitMQProducerProvider, rabbitMQServiceProvider],
})
export class RabbitMQModule {}
