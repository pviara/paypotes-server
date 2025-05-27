import { Expense } from '@expenses/domain/expense';
import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from './pair-expense';

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
            const actorExpenseBalance =
                this.calculateActorSpecificExpenseBalanceFor(expense, actorId);
            return balance + actorExpenseBalance;
        };
    }

    private calculateActorSpecificExpenseBalanceFor(
        expense: Expense,
        actorId: string,
    ): number {
        if (expense instanceof GroupExpense || expense instanceof PairExpense) {
            const actorShare = expense.getShareOf(actorId);
            return expense.hasCreditor(actorId) ? actorShare : -actorShare;
        }
        throw new Error('Expense is neither pair or group expense');
    }
}
