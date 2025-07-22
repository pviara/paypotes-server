import { Expense } from '@expenses/domain/expense';
import { GroupExpense } from '@expenses/domain/group-expense';

export class Share {
    constructor(private expense: Expense) {}

    calculateFor(actorId: string): number {
        if (this.isGroupExpenseCreditor(actorId)) {
            return this.calculateTotalOwedSharesTo(actorId);
        }
        const share = this.expense.getShareOf(actorId);
        return this.expense.hasCreditor(actorId) ? share : -share;
    }

    private isGroupExpenseCreditor(actorId: string): boolean {
        return (
            this.expense instanceof GroupExpense &&
            this.expense.hasCreditor(actorId)
        );
    }

    private calculateTotalOwedSharesTo(actorId: string): number {
        const counterparties = this.expense.getCounterpartiesOf(actorId);
        const shares = counterparties.map((counterparty) =>
            counterparty.getShare(),
        );
        return shares.reduce((prev, next) => prev + next, 0);
    }
}
