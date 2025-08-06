import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { GroupExpenseSnapshot } from '@expenses/domain/expense/group/group-expense-snapshot';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';
import { Expense } from '@expenses/domain/expense/expense';
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

    async execute(
        query: GetActorExpenseByIdQuery,
    ): Promise<GroupExpenseSnapshot | PairExpenseSnapshot> {
        const { actorId, expenseId } = query.payload;
        const expense = await this.expenseRepository.getActorExpenseById(
            actorId,
            expenseId,
        );

        if (!expense) throw new ExpenseNotFoundError(expenseId);
        return this.mapToExpenseSnapshot(expense, actorId);
    }

    private mapToExpenseSnapshot(
        expense: Expense,
        actorId: string,
    ): GroupExpenseSnapshot | PairExpenseSnapshot {
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
    }
}

export class ExpenseNotFoundError extends Error {
    constructor(id: string) {
        super(`Expense with id '${id}' cannot be found`);
    }
}
