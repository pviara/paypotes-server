import { ContactApplicationTasksModule } from '@contacts/application/tasks/contact.application-tasks.module';
import { ContactTaskHandler } from '@infra/contact-task-handling/contact.task-handler';
import { contactTaskHandlerProvider } from '@infra/contact-task-handling/contact.task-handler.provider';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

@Module({
    exports: [ContactTaskHandler],
    imports: [ContactApplicationTasksModule, CqrsModule],
    providers: [contactTaskHandlerProvider],
})
export class ContactTaskHandlerModule {}
