import { Expense } from '@expenses/domain/expense/expense';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';

/**
 * Represents the financial position of a stakeholder in a specific expense.
 *
 * When given stakeholder is creditor, their `Position` is the total
 * amount that other stakeholders still owe them. Otherwise when they
 * are debtor, their `Position` is their fair share.
 *
 * **example:**
 * in a $30 expense split between 3 people, if Alice paid $20, her
 * position is +20, while Bob and Charlie each have a Position of -10.
 */
export class Position {
    constructor(private expense: Expense) {}

    calculateFor(stakeholderId: string): number {
        if (this.isGroupExpenseCreditor(stakeholderId)) {
            return this.calculateTotalOwedSharesTo(stakeholderId);
        }
        const share = this.expense.getShareOf(stakeholderId);
        return this.expense.hasCreditor(stakeholderId) ? share : -share;
    }

    private isGroupExpenseCreditor(actorId: string): boolean {
        return (
            this.expense instanceof GroupExpense &&
            this.expense.hasCreditor(actorId)
        );
    }

    private calculateTotalOwedSharesTo(stakeholderId: string): number {
        const counterparties = this.expense.getCounterpartiesOf(stakeholderId);
        const shares = counterparties.map((counterparty) =>
            counterparty.getShare(),
        );
        return shares.reduce((prev, next) => prev + next, 0);
    }
}
