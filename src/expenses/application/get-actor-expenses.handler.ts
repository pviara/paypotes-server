import { IQuery, IQueryHandler } from '@nestjs/cqrs';

export class GetActorExpensesQuery implements IQuery {
    constructor(
        private payload: {
            actorId: string;
            search: string;
        },
    ) {}
}

export class GetActorExpensesHandler
    implements IQueryHandler<GetActorExpensesQuery>
{
    execute(query: GetActorExpensesQuery): Promise<unknown> {
        throw new Error('Method not implemented.');
    }
}
