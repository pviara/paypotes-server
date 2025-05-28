import { GroupExpense } from '@app/expenses/domain/group-expense';
import { GroupExpensePerspectiveView } from '@app/expenses/domain/group-expense-perspective-view';
import { PairExpense } from '@app/expenses/domain/pair-expense';
import { PairExpensePerspectiveView } from '@app/expenses/domain/pair-expense-perspective-view';
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

        if (!expense) throw new ExpenseNotFoundError(expenseId);
        return this.mapToPerspectiveView(expense, actorId);
    }

    private mapToPerspectiveView(expense: Expense, actorId: string): Expense {
        if (expense instanceof PairExpense)
            return PairExpensePerspectiveView.from(expense, actorId);
        if (expense instanceof GroupExpense)
            return GroupExpensePerspectiveView.from(expense, actorId);

        throw new Error('Expense is neither pair or group expense');
    }
}

export class ExpenseNotFoundError extends Error {
    constructor(id: string) {
        super(`Expense with id '${id}' cannot be found`);
    }
}
