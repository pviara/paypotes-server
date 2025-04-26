import { DefaultRabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { Module } from '@nestjs/common';
import { RabbitMQConsumer } from '@infra/rabbitmq/rabbitmq.consumer';
import {
    rabbitMQProducerProvider,
    rabbitMQProducerToken,
} from '@infra/rabbitmq/rabbitmq.producer.provider';

@Module({
    exports: [rabbitMQProducerToken],
    providers: [
        DefaultRabbitMQService,
        RabbitMQConsumer,
        rabbitMQProducerProvider,
    ],
})
export class RabbitMQModule {}
