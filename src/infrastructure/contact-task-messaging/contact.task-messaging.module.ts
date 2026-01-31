import { ContactTaskHandlerModule } from '@infra/contact-task-handling/contact.task-handler.module';
import { ContactTaskProducer } from '@infra/contact-task-messaging/contact.task-producer';
import { contactTaskProducerProvider } from '@infra/contact-task-messaging/contact.task-producer.provider';
import { ContactTaskConsumer } from '@infra/contact-task-messaging/contact.task-consumer';
import { contactTaskConsumerProvider } from '@infra/contact-task-messaging/contact.task-consumer.provider';
import { Module } from '@nestjs/common';
import { MessagingModule } from '@infra/messaging/messaging.module';

@Module({
    exports: [ContactTaskProducer, ContactTaskConsumer],
    imports: [ContactTaskHandlerModule, MessagingModule],
    providers: [contactTaskProducerProvider, contactTaskConsumerProvider],
})
export class ContactTaskMessagingModule {}
