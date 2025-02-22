import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';

export class GetActorGroupByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupByIdQuery)
export class GetActorGroupByIdHandler
    implements IQueryHandler<GetActorGroupByIdQuery>
{
    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,
    ) {}

    async execute(query: GetActorGroupByIdQuery): Promise<Group> {
        const { actorId, groupId } = query.payload;
        const group = await this.groupRepository.getActorGroupById(
            actorId,
            groupId,
        );

        if (group) return group;
        throw new GroupNotFoundError(groupId);
    }
}

export class GroupNotFoundError extends Error {
    constructor(id: string) {
        super(`Group with id '${id}' cannot be found`);
    }
}
