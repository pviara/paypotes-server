import {
    ExpenseRepository,
    ExpensesByContact,
} from '@expenses/persistence/expense.repository';
import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { ContactWithBalance } from '@contacts/domain/contact-with-balance';
import { Expense } from '@expenses/domain/expense/expense';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';
import { Scope } from '@nestjs/common';

export class GetActorContactsWithBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorContactsWithBalanceQuery, { scope: Scope.REQUEST })
export class GetActorContactsWithBalanceHandler
    implements IQueryHandler<GetActorContactsWithBalanceQuery>
{
    private contacts: Array<Contact> = [];

    constructor(
        private contactRepository: ContactRepository,
        private expenseRepository: ExpenseRepository,
    ) {}

    @Log('debug')
    async execute(
        query: GetActorContactsWithBalanceQuery,
    ): Promise<ContactWithBalance[]> {
        const contactIds = await this.getContactIdsUsing(query);

        const { actorId } = query.payload;
        const expensesByContact =
            await this.expenseRepository.getAllActorContactsExpenses(
                actorId,
                contactIds,
            );

        const result = this.mapToContactsWithBalance(
            expensesByContact,
            actorId,
        );

        return result;
    }

    private async getContactIdsUsing(query: GetActorContactsWithBalanceQuery) {
        const { actorId, pageIndex, search } = query.payload;

        const contacts = await this.contactRepository.getActorContacts(
            actorId,
            pageIndex,
            search,
        );
        this.contacts = contacts;

        return this.mapIdsFrom(contacts);
    }

    private mapIdsFrom(contacts: Array<Contact>): Array<string> {
        return contacts.map((contact) => contact.getId());
    }

    private mapToContactsWithBalance(
        expensesByContact: ExpensesByContact,
        actorId: string,
    ): Array<ContactWithBalance> {
        if (this.areAllContactsWithoutExpenses(expensesByContact)) {
            return this.mapSavedContactsToContactsWithDefaultBalance(actorId);
        }

        return this.mapExpensesByContactToContactsWithBalance(
            expensesByContact,
            actorId,
        );
    }

    private areAllContactsWithoutExpenses(
        expensesByContact: ExpensesByContact,
    ): boolean {
        return Object.keys(expensesByContact).length === 0;
    }

    private mapSavedContactsToContactsWithDefaultBalance(
        actorId: string,
    ): Array<ContactWithBalance> {
        return this.contacts.map((contact) =>
            this.buildContactWithBalanceFrom(contact.getId(), actorId),
        );
    }

    private buildContactWithBalanceFrom(
        contactId: string,
        actorId: string,
        expenses: Array<Expense> = [],
    ): ContactWithBalance {
        return ContactWithBalance.from({
            contact: this.getContactFromSavedList(contactId),
            expenses,
            perspectiveId: actorId,
        });
    }

    private getContactFromSavedList(contactId: string): Contact {
        const contact = this.contacts.find(
            (contact) => contact.getId() === contactId,
        );
        if (contact) return contact;
        throw new ContactNotFoundInSavedList(contactId);
    }

    private mapExpensesByContactToContactsWithBalance(
        expensesByContact: ExpensesByContact,
        actorId: string,
    ): Array<ContactWithBalance> {
        return Object.entries(expensesByContact).map(([contactId, expenses]) =>
            this.buildContactWithBalanceFrom(contactId, actorId, expenses),
        );
    }
}

export class ContactNotFoundInSavedList extends Error {
    constructor(contactId: string) {
        super(
            `Contact with id "${contactId}" could not be found in saved list although it should have`,
        );
    }
}
