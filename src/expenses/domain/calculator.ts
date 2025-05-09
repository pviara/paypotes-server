import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from '@expenses/domain/pair-expense';

type AnyKindOfExpense = GroupExpense | PairExpense;

export class Calculator {
    constructor(private expenses: Array<AnyKindOfExpense>) {}

    calculateFor(actorId: string): number {
        return this.expenses.reduce(
            this.calculateExpenseBalanceFor(actorId),
            0,
        );
    }

    private calculateExpenseBalanceFor(
        actorId: string,
    ): (balance: number, expense: AnyKindOfExpense) => number {
        return (balance, expense) => {
            const actorBalance = this.calculateActorBalance(expense, actorId);
            return balance + actorBalance;
        };
    }

    private calculateActorBalance(
        expense: AnyKindOfExpense,
        actorId: string,
    ): number {
        if (expense instanceof GroupExpense) {
            const actorShare = expense.getShareOf(actorId);
            return expense.hasCreditor(actorId) ? actorShare : -actorShare;
        }
        const expenseBalance = expense.getRawBalance();
        return expense.hasCreditor(actorId) ? expenseBalance : -expenseBalance;
    }
}
