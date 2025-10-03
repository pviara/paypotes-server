import { Expense } from '@expenses/domain/expense/expense';

type Terms = {
    contactId: string;
    expense: Expense;
    stakeholderId: string;
};

export class ContactPosition {
    private constructor(private value: number) {}

    static calculate({ contactId, expense, stakeholderId }: Terms): number {
        const shareOwedByContact = expense.getShareOf(contactId);
        const sharedStakeholderShouldPay = -expense.getShareOf(stakeholderId);

        const position = expense.hasCreditor(stakeholderId)
            ? shareOwedByContact
            : sharedStakeholderShouldPay;

        return new ContactPosition(position).value;
    }
}
