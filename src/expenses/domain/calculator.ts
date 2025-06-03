import { Expense } from '@expenses/domain/expense';

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
        // todo: we're gonna need this calculation here too, but not for now
        // if (expense instanceof GroupExpense) {
        //     if (!expense.hasCreditor(actorId)) {
        //         const actorShare = expense.getShareOf(actorId);
        //         return -actorShare;
        //     }

        //     const stakeholders = expense.getStakeholdersExcluding(actorId);
        //     const shares = stakeholders.map((stakeholder) =>
        //         stakeholder.getShare(),
        //     );
        //     return shares.reduce((prev, next) => prev + next, 0);
        // }

        const actorShare = expense.getShareOf(actorId);
        return expense.hasCreditor(actorId) ? actorShare : -actorShare;
    }
}
