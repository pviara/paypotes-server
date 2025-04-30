import { ContactController } from '@contacts/presentation/contact.controller';
import { ContactRepositoryModule } from '@contacts/persistence/contact.repository-module';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseRepositoryModule } from '@expenses/persistence/expense.repository-module';
import { GetActorContactWithBalanceByIdHandler } from '@contacts/application/get-actor-contact-with-balance-by-id.handler';
import { GetActorContactsHandler } from '@contacts/application/get-actor-contacts.handler';
import { GetActorContactsWithBalanceHandler } from '@contacts/application/get-actor-contacts-with-balance.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ContactController],
    imports: [ContactRepositoryModule, CqrsModule, ExpenseRepositoryModule],
    providers: [
        GetActorContactWithBalanceByIdHandler,
        GetActorContactsHandler,
        GetActorContactsWithBalanceHandler,
    ],
})
export class ContactModule {}
