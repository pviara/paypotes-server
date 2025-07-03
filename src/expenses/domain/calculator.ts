import { Expense } from '@expenses/domain/expense';
import { ShareCalculator } from '@expenses/domain/share-calculator';

export class Calculator {
    private readonly ZERO = 0;

    constructor(private expenses: Array<Expense>) {}

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
            const actorExpenseBalance = new ShareCalculator(
                expense,
            ).calculateFor(actorId);
            return balance + actorExpenseBalance;
        };
    }
}
