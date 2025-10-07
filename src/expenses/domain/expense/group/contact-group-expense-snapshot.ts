import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { ContactPosition } from '../../balance/contact-position';

type CreateContactGroupExpenseSnapshot = {
    contactId: string;
    expense: GroupExpense;
    perspectiveId: string;
};

export class ContactGroupExpenseSnapshot {
    private constructor(
        private expense: GroupExpense,
        private perspectiveBalance: number,
    ) {}

    static create({
        contactId,
        expense,
        perspectiveId,
    }: CreateContactGroupExpenseSnapshot): ContactGroupExpenseSnapshot {
        const perspectiveBalance = ContactPosition.calculate({
            contactId,
            expense,
            stakeholderId: perspectiveId,
        });
        return new ContactGroupExpenseSnapshot(expense, perspectiveBalance);
    }

    getExpense(): GroupExpense {
        return this.expense;
    }

    getPerspectiveBalance(): number {
        return this.perspectiveBalance;
    }
}
