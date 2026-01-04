import { ContactTaskHandlerModule } from '@infra/contact-task-handlers/contact.task-handler.module';
import { ContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { contactTaskMessengerProvider } from '@infra/contact-task-managers/contact.task-messenger.provider';
import { ContactTaskRecipient } from '@infra/contact-task-managers/contact.task-recipient';
import { contactTaskRecipientProvider } from '@infra/contact-task-managers/contact.task-recipient.provider';
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@infra/rabbitmq/rabbitmq.module';

@Module({
    exports: [ContactTaskMessenger, ContactTaskRecipient],
    imports: [ContactTaskHandlerModule, RabbitMQModule],
    providers: [contactTaskMessengerProvider, contactTaskRecipientProvider],
})
export class ContactTaskManagerModule {}
