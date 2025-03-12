import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupExpense } from '@expenses/domain/group-expense';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetActorGroupExpenseByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
            expenseId: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupExpenseByIdQuery)
export class GetActorGroupExpenseByIdHandler
    implements IQueryHandler<GetActorGroupExpenseByIdQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(query: GetActorGroupExpenseByIdQuery): Promise<GroupExpense> {
        const { actorId, groupId, expenseId } = query.payload;
        const expense = await this.expenseRepository.getActorGroupExpenseById(
            actorId,
            groupId,
            expenseId,
        );

        if (expense) return expense;
        throw new GroupExpenseNotFoundError(groupId, expenseId);
    }
}

export class GroupExpenseNotFoundError extends Error {
    constructor(groupId: string, expenseId: string) {
        super(
            `Expense with groupId '${groupId}' and expenseId '${expenseId}' cannot be found`,
        );
    }
}
