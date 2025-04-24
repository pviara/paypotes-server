import { Module } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';

@Module({
    providers: [RabbitMQService],
})
export class RabbitMQModule {}
