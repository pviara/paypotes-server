import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from '@expenses/domain/pair-expense';

export class ShareCalculator {
    constructor(private expense: GroupExpense | PairExpense) {}

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
