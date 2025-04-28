import {
    contactTaskMessengerProvider,
    contactTaskMessengerToken,
} from '@infra/task-managers/contact.task-messenger.provider';
import {
    contactTaskRecipientProvider,
    contactTaskRecipientToken,
} from '@infra/task-managers/contact.task-recipient.provider';
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@infra/rabbitmq/rabbitmq.module';

@Module({
    exports: [contactTaskMessengerToken, contactTaskRecipientToken],
    imports: [RabbitMQModule],
    providers: [contactTaskMessengerProvider, contactTaskRecipientProvider],
})
export class ContactTaskMessengerModule {}
