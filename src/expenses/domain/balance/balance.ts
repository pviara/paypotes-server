import { Expense } from '@expenses/domain/expense/expense';
import { Share } from '@expenses/domain/balance/share';

export class Balance {
    private readonly ZERO = 0;
    private readonly expenses: Array<Expense>;

    constructor(...expenses: Array<Expense>) {
        this.expenses = expenses;
    }

    calculateFor(actorId: string): number {
        return this.expenses.reduce(
            this.calculateExpenseBalanceFor(actorId),
            this.ZERO,
        );
    }

    private calculateExpenseBalanceFor(
        actorId: string,
    ): (balance: number, expense: Expense) => number {
        return (balance, expense) => {
            const actorExpenseBalance = new Share(expense).calculateFor(
                actorId,
            );
            return balance + actorExpenseBalance;
        };
    }
}
