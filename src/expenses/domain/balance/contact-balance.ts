import { ContactPosition } from '@expenses/domain/balance/contact-position';
import { Expense } from '@expenses/domain/expense/expense';
import { ZERO } from '@app/shared/zero';

type Terms = {
    contactId: string;
    expenses: Array<Expense>;
    stakeholderId: string;
};

export class ContactBalance {
    private constructor(private value: number) {}

    static calculate({ contactId, expenses, stakeholderId }: Terms): number {
        const balance = expenses.reduce(
            this.calculateExpenseBalanceFor(contactId, stakeholderId),
            ZERO,
        );
        return new ContactBalance(balance).value;
    }

    private static calculateExpenseBalanceFor(
        contactId: string,
        stakeholderId: string,
    ): (balance: number, expense: Expense) => number {
        return (balance, expense) => {
            return (
                balance +
                ContactPosition.calculate({ contactId, expense, stakeholderId })
            );
        };
    }
}
