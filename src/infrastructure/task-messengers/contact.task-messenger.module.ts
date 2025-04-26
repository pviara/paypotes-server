import {
    contactTaskMessengerProvider,
    contactTaskMessengerToken,
} from '@infra/task-messengers/contact.task-messenger.provider';
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@infra/rabbitmq/rabbitmq.module';

@Module({
    exports: [contactTaskMessengerToken],
    imports: [RabbitMQModule],
    providers: [contactTaskMessengerProvider],
})
export class ContactTaskMessengerModule {}
