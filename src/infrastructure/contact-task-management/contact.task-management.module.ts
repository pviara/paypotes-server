import { ContactTaskHandlerModule } from '@infra/contact-task-handlers/contact.task-handler.module';
import { ContactTaskProducer } from '@infra/contact-task-management/contact.task-producer';
import { contactTaskProducerProvider } from '@infra/contact-task-management/contact.task-producer.provider';
import { ContactTaskConsumer } from '@infra/contact-task-management/contact.task-consumer';
import { contactTaskConsumerProvider } from '@infra/contact-task-management/contact.task-consumer.provider';
import { Module } from '@nestjs/common';
import { MessagingModule } from '@infra/rabbitmq/messaging.module';

@Module({
    exports: [ContactTaskProducer, ContactTaskConsumer],
    imports: [ContactTaskHandlerModule, MessagingModule],
    providers: [contactTaskProducerProvider, contactTaskConsumerProvider],
})
export class ContactTaskManagementModule {}
