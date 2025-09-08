import { Expense } from '@expenses/domain/expense/expense';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { GroupExpenseSnapshot } from '@expenses/domain/expense/group/group-expense-snapshot';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';

export class GetActorExpensesQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorExpensesQuery)
export class GetActorExpensesHandler
    implements IQueryHandler<GetActorExpensesQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    @Log('log')
    async execute(
        query: GetActorExpensesQuery,
    ): Promise<(GroupExpenseSnapshot | PairExpenseSnapshot)[]> {
        const { actorId, pageIndex, search } = query.payload;
        const expenses = await this.expenseRepository.getActorExpenses(
            actorId,
            pageIndex,
            search,
        );
        return this.mapToExpenseSnapshots(expenses, actorId);
    }

    private mapToExpenseSnapshots(
        expenses: Array<Expense>,
        actorId: string,
    ): Array<GroupExpenseSnapshot | PairExpenseSnapshot> {
        return expenses.map((expense) => {
            if (expense instanceof PairExpense)
                return PairExpenseSnapshot.create({
                    expense,
                    perspectiveId: actorId,
                });
            if (expense instanceof GroupExpense)
                return GroupExpenseSnapshot.create({
                    expense,
                    perspectiveId: actorId,
                });

            throw new Error('Expense is neither pair or group expense');
        });
    }
}
