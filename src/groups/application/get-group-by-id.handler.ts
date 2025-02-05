import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetGroupByIdQuery implements IQuery {
    constructor(readonly id: string) {}
}

@QueryHandler(GetGroupByIdQuery)
export class GetGroupByIdHandler implements IQueryHandler<GetGroupByIdQuery> {
    execute(query: GetGroupByIdQuery): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
