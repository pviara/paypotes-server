import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

export class GetActorGroupsQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupsQuery)
export class GetActorGroupsHandler
    implements IQueryHandler<GetActorGroupsQuery>
{
    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,
    ) {}

    @Log('log')
    async execute(query: GetActorGroupsQuery): Promise<Group[]> {
        const { actorId, pageIndex, search } = query.payload;
        return this.groupRepository.getActorGroups(actorId, pageIndex, search);
    }
}
