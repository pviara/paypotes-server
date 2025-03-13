import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupExpense } from '@expenses/domain/group-expense';
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

    execute(query: GetActorGroupExpensesQuery): Promise<GroupExpense[]> {
        const { actorId, groupId, pageIndex, search } = query.payload;
        return this.expenseRepository.getActorGroupExpenses(
            actorId,
            groupId,
            pageIndex,
            search,
        );
    }
}
