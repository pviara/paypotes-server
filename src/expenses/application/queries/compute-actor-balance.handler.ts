import { Balance } from '@expenses/domain/balance/balance';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class ComputeActorBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
        },
    ) {}
}

@QueryHandler(ComputeActorBalanceQuery)
export class ComputeActorBalanceHandler
    implements IQueryHandler<ComputeActorBalanceQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private repository: ExpenseRepository,
    ) {}

    async execute(query: ComputeActorBalanceQuery): Promise<number> {
        const { actorId } = query.payload;
        const expenses = await this.repository.getAllActorExpenses(actorId);

        return Balance.calculate({ expenses, stakeholderId: actorId });
    }
}
