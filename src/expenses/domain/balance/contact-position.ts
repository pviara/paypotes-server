import { Expense } from '@expenses/domain/expense/expense';

type Terms = {
    contactId: string;
    expense: Expense;
    stakeholderId: string;
};

export class ContactPosition {
    private constructor(private value: number) {}

    static calculate({ contactId, expense, stakeholderId }: Terms): number {
        const position = expense.hasCreditor(stakeholderId)
            ? expense.getShareOf(contactId)
            : -expense.getShareOf(stakeholderId);
        return new ContactPosition(position).value;
    }
}
