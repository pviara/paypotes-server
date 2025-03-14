import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PairExpense } from '@expenses/domain/pair-expense';

export class GetActorContactExpensesQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorContactExpensesQuery)
export class GetActorContactExpensesHandler
    implements IQueryHandler<GetActorContactExpensesQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    execute(query: GetActorContactExpensesQuery): Promise<PairExpense[]> {
        const { actorId, contactId, pageIndex, search } = query.payload;
        return this.expenseRepository.getActorContactExpenses(
            actorId,
            contactId,
            pageIndex,
            search,
        );
    }
}
