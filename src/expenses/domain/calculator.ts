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
            // const stakeholder = expense.getStakeholder(actorId);
            // const share = stakeholder.getShare();
            // const actorBalance = expense.hasCreditor(actorId) ? share : -share;
            const expenseBalance = expense.getRawBalance(); // -> get stakeholder's share
            const actorBalance = expense.hasCreditor(actorId)
                ? expenseBalance
                : -expenseBalance;

            return balance + actorBalance;
        };
    }
}
