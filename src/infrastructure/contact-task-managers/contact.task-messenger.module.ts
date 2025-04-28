import { ContactTaskHandlerModule } from '@app/infrastructure/contact-task-handlers/contact.task-handler.module';
import {
    contactTaskMessengerProvider,
    contactTaskMessengerToken,
} from '@infra/contact-task-managers/contact.task-messenger.provider';
import {
    contactTaskRecipientProvider,
    contactTaskRecipientToken,
} from '@infra/contact-task-managers/contact.task-recipient.provider';
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@infra/rabbitmq/rabbitmq.module';

@Module({
    exports: [contactTaskMessengerToken, contactTaskRecipientToken],
    imports: [ContactTaskHandlerModule, RabbitMQModule],
    providers: [contactTaskMessengerProvider, contactTaskRecipientProvider],
})
export class ContactTaskMessengerModule {}
