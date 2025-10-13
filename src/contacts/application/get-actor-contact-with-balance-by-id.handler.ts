import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { ContactWithBalance } from '@contacts/domain/contact-with-balance';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

export class GetActorContactWithBalanceByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
        },
    ) {}
}

@QueryHandler(GetActorContactWithBalanceByIdQuery)
export class GetActorContactWithBalanceByIdHandler
    implements IQueryHandler<GetActorContactWithBalanceByIdQuery>
{
    constructor(
        private contactRepository: ContactRepository,

        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    @Log('debug')
    async execute(
        query: GetActorContactWithBalanceByIdQuery,
    ): Promise<ContactWithBalance> {
        const contact = await this.getContactUsing(query);

        const { actorId } = query.payload;
        const expenses =
            await this.expenseRepository.getAllActorContactExpenses(
                actorId,
                contact.getId(),
            );

        return ContactWithBalance.from({
            contact,
            expenses,
            perspectiveId: actorId,
        });
    }

    private async getContactUsing(
        query: GetActorContactWithBalanceByIdQuery,
    ): Promise<Contact> {
        const { actorId, contactId } = query.payload;
        const contact = await this.contactRepository.getActorContactById(
            actorId,
            contactId,
        );

        if (contact) return contact;
        throw new ContactNotFoundError(contactId);
    }
}

export class ContactNotFoundError extends Error {
    constructor(id: string) {
        super(`Contact with id '${id}' cannot be found`);
    }
}
