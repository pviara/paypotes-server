import { Module } from '@nestjs/common';
import { RabbitMQConsumer } from '@infra/rabbitmq/rabbitmq.consumer';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { RabbitMQProducer } from '@infra/rabbitmq/rabbitmq.producer';

@Module({
    providers: [RabbitMQConsumer, RabbitMQProducer, RabbitMQService],
})
export class RabbitMQModule {}
