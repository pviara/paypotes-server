import { ContactApplicationTasksModule } from '@contacts/application/tasks/contact.application-tasks.module';
import {
    contactTaskHandlerProvider,
    contactTaskHandlerToken,
} from '@infra/contact-task-handlers/contact.task-handler.provider';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

@Module({
    exports: [contactTaskHandlerToken],
    imports: [ContactApplicationTasksModule, CqrsModule],
    providers: [contactTaskHandlerProvider],
})
export class ContactTaskHandlerModule {}
