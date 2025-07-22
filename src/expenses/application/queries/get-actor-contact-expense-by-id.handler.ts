import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PairExpenseSnapshot } from '@expenses/domain/pair-expense/pair-expense-snapshot';

export class GetActorContactExpenseByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
            expenseId: string;
        },
    ) {}
}

@QueryHandler(GetActorContactExpenseByIdQuery)
export class GetActorContactExpenseByIdHandler
    implements IQueryHandler<GetActorContactExpenseByIdQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(
        query: GetActorContactExpenseByIdQuery,
    ): Promise<PairExpenseSnapshot> {
        const { actorId, contactId, expenseId } = query.payload;
        const expense = await this.expenseRepository.getActorContactExpenseById(
            actorId,
            contactId,
            expenseId,
        );

        if (expense) return PairExpenseSnapshot.from(expense, actorId);
        throw new ContactExpenseNotFoundError(contactId, expenseId);
    }
}

export class ContactExpenseNotFoundError extends Error {
    constructor(contactId: string, expenseId: string) {
        super(
            `Expense with contactId '${contactId}' and expenseId '${expenseId}' cannot be found`,
        );
    }
}
