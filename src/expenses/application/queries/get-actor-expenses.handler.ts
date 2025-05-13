import { Expense } from '@expenses/domain/expense';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupExpense } from '@expenses/domain/group-expense';
import { GroupExpensePerspectiveView } from '@expenses/domain/group-expense-perspective-view';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PairExpense } from '@expenses/domain/pair-expense';

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

    async execute(query: GetActorExpensesQuery): Promise<Expense[]> {
        const { actorId, pageIndex, search } = query.payload;
        const expenses = await this.expenseRepository.getActorExpenses(
            actorId,
            pageIndex,
            search,
        );
        return this.mapToPerspectiveView(expenses, actorId);
    }

    private mapToPerspectiveView(
        expenses: Array<Expense>,
        actorId: string,
    ): Array<Expense> {
        return expenses.map((expense) => {
            if (expense instanceof PairExpense) return expense;
            if (expense instanceof GroupExpense)
                return GroupExpensePerspectiveView.from(expense, actorId);

            throw new Error('Expense is neither pair or group expense');
        });
    }
}
