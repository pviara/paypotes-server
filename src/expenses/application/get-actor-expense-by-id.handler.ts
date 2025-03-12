import { Expense } from '@expenses/domain/expense';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetActorExpenseByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            expenseId: string;
        },
    ) {}
}

@QueryHandler(GetActorExpenseByIdQuery)
export class GetActorExpenseByIdHandler
    implements IQueryHandler<GetActorExpenseByIdQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(query: GetActorExpenseByIdQuery): Promise<Expense> {
        const { actorId, expenseId } = query.payload;
        const expense = await this.expenseRepository.getActorExpenseById(
            actorId,
            expenseId,
        );

        if (expense) return expense;
        throw new ExpenseNotFoundError(expenseId);
    }
}

export class ExpenseNotFoundError extends Error {
    constructor(id: string) {
        super(`Expense with id '${id}' cannot be found`);
    }
}
