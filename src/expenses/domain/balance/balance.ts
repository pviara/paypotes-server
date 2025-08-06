import { Expense } from '@expenses/domain/expense/expense';
import { Position } from '@expenses/domain/balance/position';

/**
 * Represents the total financial position of a stakeholder across multiple expenses.
 */
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
            return balance + new Position(expense).calculateFor(actorId);
        };
    }
}
