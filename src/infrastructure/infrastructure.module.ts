import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), RabbitMQModule],
})
export class InfrastructureModule {}
