import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { IQuery, IQueryHandler } from '@nestjs/cqrs';
import { PairExpense } from '@expenses/domain/pair-expense';

export class ComputeActorContactBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
        },
    ) {}
}

export class ComputeActorContactBalanceHandler
    implements IQueryHandler<ComputeActorContactBalanceQuery>
{
    constructor(private expenseRepo: ExpenseRepository) {}

    async execute(query: ComputeActorContactBalanceQuery): Promise<number> {
        const { actorId, contactId } = query.payload;
        const expenses = await this.expenseRepo.getAllActorContactExpenses(
            actorId,
            contactId,
        );

        return expenses.reduce(this.computeExpenseBalanceFor(actorId), 0);
    }

    private computeExpenseBalanceFor(
        actorId: string,
    ): (balance: number, expense: PairExpense) => number {
        return (balance, expense) => {
            const expenseBalance = expense.getRawBalance();
            const actorBalance = expense.hasCreditor(actorId)
                ? expenseBalance
                : -expenseBalance;

            return balance + actorBalance;
        };
    }
}
