import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
    PairExpenseSnapshot,
    PairExpenseSnapshots,
} from '@app/expenses/domain/pair-expense-snapshot';

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

    async execute(
        query: GetActorContactExpensesQuery,
    ): Promise<PairExpenseSnapshot[]> {
        const { actorId, contactId, pageIndex, search } = query.payload;
        const expenses = await this.expenseRepository.getActorContactExpenses(
            actorId,
            contactId,
            pageIndex,
            search,
        );
        return PairExpenseSnapshots.from(expenses, actorId);
    }
}
