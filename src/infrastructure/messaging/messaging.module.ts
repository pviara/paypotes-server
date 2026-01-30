import { MessageBroker } from '@infra/messaging/rabbitmq.message-broker';
import { MessageProducer } from '@infra/messaging/rabbitmq.producer';
import { Module } from '@nestjs/common';
import { rabbitMQProducerProvider } from '@infra/messaging/rabbitmq.producer.provider';
import { rabbitMQServiceProvider } from '@infra/messaging/rabbitmq.message-broker.provider';

@Module({
    exports: [MessageBroker, MessageProducer],
    providers: [rabbitMQProducerProvider, rabbitMQServiceProvider],
})
export class MessagingModule {}
