import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import {
    GroupExpenseSnapshot,
    GroupExpenseSnapshots,
} from '@app/expenses/domain/group-expense-snapshot';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetActorGroupExpensesQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupExpensesQuery)
export class GetActorGroupExpensesHandler
    implements IQueryHandler<GetActorGroupExpensesQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(
        query: GetActorGroupExpensesQuery,
    ): Promise<GroupExpenseSnapshot[]> {
        const { actorId, groupId, pageIndex, search } = query.payload;
        const expenses = await this.expenseRepository.getActorGroupExpenses(
            actorId,
            groupId,
            pageIndex,
            search,
        );
        return GroupExpenseSnapshots.from(expenses, actorId);
    }
}
