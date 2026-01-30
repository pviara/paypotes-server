import { Module } from '@nestjs/common';
import { MessageBrokerService } from '@infra/rabbitmq/rabbitmq.service';
import { Producer } from '@infra/rabbitmq/rabbitmq.producer';
import { rabbitMQProducerProvider } from '@infra/rabbitmq/rabbitmq.producer.provider';
import { rabbitMQServiceProvider } from '@infra/rabbitmq/rabbitmq.service.provider';

@Module({
    exports: [MessageBrokerService, Producer],
    providers: [rabbitMQProducerProvider, rabbitMQServiceProvider],
})
export class RabbitMQModule {}
