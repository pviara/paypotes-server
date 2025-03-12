import { SimpleExpense } from '@app/expenses/domain/simple-expense';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

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

    execute(query: GetActorExpensesQuery): Promise<SimpleExpense[]> {
        const { actorId, pageIndex, search } = query.payload;
        return this.expenseRepository.getActorExpenses(
            actorId,
            pageIndex,
            search,
        );
    }
}
