import { Balance } from '@expenses/domain/balance/balance';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

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
    constructor(private repository: ExpenseRepository) {}

    @Log('debug')
    async execute(query: ComputeActorBalanceQuery): Promise<number> {
        const { actorId } = query.payload;
        const expenses = await this.repository.getAllActorExpenses(actorId);

        return Balance.calculate({ expenses, stakeholderId: actorId });
    }
}
