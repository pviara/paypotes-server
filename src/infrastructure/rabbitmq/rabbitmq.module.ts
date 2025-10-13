import { Module } from '@nestjs/common';
import { Producer } from '@infra/rabbitmq/rabbitmq.producer';
import { rabbitMQProducerProvider } from '@infra/rabbitmq/rabbitmq.producer.provider';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceProvider } from '@infra/rabbitmq/rabbitmq.service.provider';

@Module({
    exports: [Producer, RabbitMQService],
    providers: [rabbitMQProducerProvider, rabbitMQServiceProvider],
})
export class RabbitMQModule {}
