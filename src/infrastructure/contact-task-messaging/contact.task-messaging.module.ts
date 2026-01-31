import { ContactApplicationTasksModule } from '@contacts/application/tasks/contact.application-tasks.module';
import { ContactTaskConsumer } from '@app/infrastructure/contact-task-messaging/consumer/contact.task-consumer';
import { contactTaskConsumerProvider } from '@app/infrastructure/contact-task-messaging/consumer/contact.task-consumer.provider';
import { contactTaskHandlerProvider } from '@infra/contact-task-messaging/handler/contact.task-handler.provider';
import { ContactTaskProducer } from '@app/infrastructure/contact-task-messaging/producer/contact.task-producer';
import { contactTaskProducerProvider } from '@app/infrastructure/contact-task-messaging/producer/contact.task-producer.provider';
import { CqrsModule } from '@nestjs/cqrs';
import { MessagingModule } from '@infra/messaging/messaging.module';
import { Module } from '@nestjs/common';

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
