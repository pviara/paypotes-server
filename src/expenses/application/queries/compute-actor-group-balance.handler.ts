import { Calculator } from '@expenses/domain/calculator';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class ComputeActorGroupBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
        },
    ) {}
}

@QueryHandler(ComputeActorGroupBalanceQuery)
export class ComputeActorGroupBalanceHandler
    implements IQueryHandler<ComputeActorGroupBalanceQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(query: ComputeActorGroupBalanceQuery): Promise<number> {
        const { actorId, groupId } = query.payload;
        const expenses = await this.expenseRepository.getAllActorGroupExpenses(
            actorId,
            groupId,
        );

        return new Calculator(expenses).calculateFor(actorId);
    }
}
