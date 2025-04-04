import { ContactController } from '@contacts/presentation/contact.controller';
import { contactRepositoryProvider } from '@contacts/persistence/contact.repository-provider';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseModule } from '@expenses/expense.module';
import { GetActorContactWithBalanceByIdHandler } from '@app/contacts/application/get-actor-contact-with-balance-by-id.handler';
import { GetActorContactsHandler } from '@contacts/application/get-actor-contacts.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ContactController],
    imports: [CqrsModule, ExpenseModule],
    providers: [
        contactRepositoryProvider,
        GetActorContactWithBalanceByIdHandler,
        GetActorContactsHandler,
    ],
})
export class ContactModule {}
