import { Calculator } from '@expenses/domain/calculator';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class ComputeActorContactBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
        },
    ) {}
}

@QueryHandler(ComputeActorContactBalanceQuery)
export class ComputeActorContactBalanceHandler
    implements IQueryHandler<ComputeActorContactBalanceQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private repository: ExpenseRepository,
    ) {}

    async execute(query: ComputeActorContactBalanceQuery): Promise<number> {
        const { actorId, contactId } = query.payload;
        const expenses = await this.repository.getAllActorContactExpenses(
            actorId,
            contactId,
        );

        return new Calculator(expenses).calculateFor(actorId);
    }
}
