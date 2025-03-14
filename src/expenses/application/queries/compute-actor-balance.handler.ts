import { IQuery, IQueryHandler } from '@nestjs/cqrs';

export class ComputeActorBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
        },
    ) {}
}

export class ComputeActorBalanceHandler
    implements IQueryHandler<ComputeActorBalanceQuery>
{
    async execute(query: ComputeActorBalanceQuery): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
