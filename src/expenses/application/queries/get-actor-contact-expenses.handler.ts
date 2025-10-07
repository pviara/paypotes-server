import { ContactGroupExpenseSnapshot } from '@expenses/domain/expense/group/contact-group-expense-snapshot';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';

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

    @Log('debug')
    async execute(
        query: GetActorContactExpensesQuery,
    ): Promise<(ContactGroupExpenseSnapshot | PairExpenseSnapshot)[]> {
        const { actorId, contactId, pageIndex, search } = query.payload;
        const expenses = await this.expenseRepository.getActorContactExpenses(
            actorId,
            contactId,
            pageIndex,
            search,
        );
        return this.mapToExpenseSnapshots(expenses, actorId, contactId);
    }

    private mapToExpenseSnapshots(
        expenses: Array<Expense>,
        actorId: string,
        contactId: string,
    ): Array<ContactGroupExpenseSnapshot | PairExpenseSnapshot> {
        return expenses
            .map((expense) => {
                if (expense instanceof PairExpense)
                    return PairExpenseSnapshot.create({
                        expense,
                        perspectiveId: actorId,
                    });
                if (expense instanceof GroupExpense)
                    return ContactGroupExpenseSnapshot.create({
                        contactId,
                        expense,
                        perspectiveId: actorId,
                    });

                throw new Error('Expense is neither pair or group expense');
            })
            .filter((expense) => expense.getPerspectiveBalance() !== 0);
    }
}
