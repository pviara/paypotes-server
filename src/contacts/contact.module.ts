import { ContactController } from '@contacts/presentation/contact.controller';
import { contactRepositoryProvider } from '@contacts/persistence/contact.repository-provider';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseModule } from '@expenses/expense.module';
import { GetActorContactByIdHandler } from '@contacts/application/get-actor-contact-by-id.handler';
import { GetActorContactsHandler } from '@contacts/application/get-actor-contacts.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ContactController],
    imports: [CqrsModule, ExpenseModule],
    providers: [
        contactRepositoryProvider,
        GetActorContactByIdHandler,
        GetActorContactsHandler,
    ],
})
export class ContactModule {}
