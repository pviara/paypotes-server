import { ContactApplicationTasksModule } from '@contacts/application/tasks/contact.application-tasks.module';
import { ContactTaskConsumer } from '@infra/contact-task-messaging/contact.task-consumer';
import { contactTaskConsumerProvider } from '@infra/contact-task-messaging/contact.task-consumer.provider';
import { contactTaskHandlerProvider } from '@infra/contact-task-messaging/handler/contact.task-handler.provider';
import { ContactTaskProducer } from '@infra/contact-task-messaging/contact.task-producer';
import { contactTaskProducerProvider } from '@infra/contact-task-messaging/contact.task-producer.provider';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { MessagingModule } from '@infra/messaging/messaging.module';

@Module({
    exports: [ContactTaskProducer, ContactTaskConsumer],
    imports: [ContactApplicationTasksModule, CqrsModule, MessagingModule],
    providers: [
        contactTaskConsumerProvider,
        contactTaskProducerProvider,
        contactTaskHandlerProvider,
    ],
})
export class ContactTaskMessagingModule {}
