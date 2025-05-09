import { Expense } from '@expenses/domain/expense';
import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from '@expenses/domain/pair-expense';

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
            if (expense instanceof PairExpense) {
                const expenseBalance = expense.getRawBalance();
                const actorBalance = expense.hasCreditor(actorId)
                    ? expenseBalance
                    : -expenseBalance;

                return balance + actorBalance;
            } else if (expense instanceof GroupExpense) {
                const actorShare = this.getActorShareFrom(expense, actorId);
                const actorBalance = expense.hasCreditor(actorId)
                    ? actorShare
                    : -actorShare;

                return balance + actorBalance;
            } else {
                throw new Error();
            }
        };
    }

    private getActorShareFrom(expense: GroupExpense, actorId: string): number {
        const stakeholder = expense
            .getStakeholders()
            .find((stakeholder) => stakeholder.getId() === actorId);

        if (stakeholder) return stakeholder.getShare();
        throw new Error('Actor stakeholder profile could not be found');
    }
}
