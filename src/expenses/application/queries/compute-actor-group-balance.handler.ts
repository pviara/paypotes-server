import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupExpense } from '@expenses/domain/group-expense';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class ComputeActorGroupBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
        },
    ) {}
}

@QueryHandler(ComputeActorGroupBalanceQuery)
export class ComputeActorGroupBalanceHandler
    implements IQueryHandler<ComputeActorGroupBalanceQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepo: ExpenseRepository,
    ) {}

    async execute(query: ComputeActorGroupBalanceQuery): Promise<number> {
        const { actorId, groupId } = query.payload;
        const expenses = await this.expenseRepo.getAllActorGroupExpenses(
            actorId,
            groupId,
        );

        return expenses.reduce(this.computeExpenseBalanceFor(actorId), 0);
    }

    private computeExpenseBalanceFor(
        actorId: string,
    ): (balance: number, expense: GroupExpense) => number {
        return (balance, expense) => {
            const expenseBalance = expense.getRawBalance();
            const actorBalance = expense.hasCreditor(actorId)
                ? expenseBalance
                : -expenseBalance;

            return balance + actorBalance;
        };
    }
}
