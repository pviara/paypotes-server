import { ContactController } from '@contacts/presentation/contact.controller';
import { contactRepositoryProvider } from '@contacts/persistence/contact.repository-provider';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseRepositoryModule } from '@expenses/persistence/expense.repository-module';
import { GetActorContactWithBalanceByIdHandler } from '@contacts/application/get-actor-contact-with-balance-by-id.handler';
import { GetActorContactsHandler } from '@contacts/application/get-actor-contacts.handler';
import { GetActorContactsWithBalanceHandler } from '@contacts/application/get-actor-contacts-with-balance.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ContactController],
    imports: [CqrsModule, ExpenseRepositoryModule],
    providers: [
        contactRepositoryProvider,
        GetActorContactWithBalanceByIdHandler,
        GetActorContactsHandler,
        GetActorContactsWithBalanceHandler,
    ],
})
export class ContactModule {}
