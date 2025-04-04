import {
    ExpenseRepository,
    ExpensesByContact,
} from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { Inject, Scope } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ContactWithBalance } from '../domain/contact-with-balance';
import { Expense } from '@app/expenses/domain/expense';

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
        @Inject(contactRepositoryToken)
        private contactRepository: ContactRepository,

        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

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

        return this.mapToContactsWithBalance(expensesByContact, actorId);
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
            return this.contacts.map((contact) =>
                this.buildContactWithBalanceFrom(contact.getId(), actorId),
            );
        }

        return this.mapExpensesToContactsWithBalance(
            expensesByContact,
            actorId,
        );
    }

    private areAllContactsWithoutExpenses(
        expensesByContact: ExpensesByContact,
    ): boolean {
        return Object.keys(expensesByContact).length === 0;
    }

    private mapExpensesToContactsWithBalance(
        expensesByContact: ExpensesByContact,
        actorId: string,
    ): Array<ContactWithBalance> {
        return Object.entries(expensesByContact).map(([contactId, expenses]) =>
            this.buildContactWithBalanceFrom(contactId, actorId, expenses),
        );
    }

    private buildContactWithBalanceFrom(
        contactId: string,
        actorId: string,
        expenses: Array<Expense> = [],
    ): ContactWithBalance {
        return ContactWithBalance.from({
            contact: this.getContactFromSavedLits(contactId),
            expenses,
            perspectiveId: actorId,
        });
    }

    private getContactFromSavedLits(contactId: string): Contact {
        const contact = this.contacts.find(
            (contact) => contact.getId() === contactId,
        );
        if (contact) return contact;
        throw new ContactNotFoundInSavedList(contactId);
    }
}

export class ContactNotFoundInSavedList extends Error {
    constructor(contactId: string) {
        super(
            `Contact with "${contactId}" could not be found in saved list although it should have`,
        );
    }
}
