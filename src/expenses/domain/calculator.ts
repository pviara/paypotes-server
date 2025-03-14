import { Expense } from '@expenses/domain/expense';

export class Calculator {
    constructor(private expenses: Array<Expense>) {}

    calculateFor(actorId: string): number {
        return this.expenses.reduce(
            this.calculateExpenseBalanceFor(actorId),
            0,
        );
    }

    private calculateExpenseBalanceFor(
        actorId: string,
    ): (balance: number, expense: Expense) => number {
        return (balance, expense) => {
            const expenseBalance = expense.getRawBalance();
            const actorBalance = expense.hasCreditor(actorId)
                ? expenseBalance
                : -expenseBalance;

            return balance + actorBalance;
        };
    }
}
