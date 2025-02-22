import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { User } from '@app/users/domain/user';

export class GetGroupByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actor: User;
            id: string;
        },
    ) {}
}

@QueryHandler(GetGroupByIdQuery)
export class GetGroupByIdHandler implements IQueryHandler<GetGroupByIdQuery> {
    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,
    ) {}

    async execute({ payload }: GetGroupByIdQuery): Promise<Group> {
        const group = await this.groupRepository.getById(payload.id);
        if (!group) throw new GroupNotFoundError(payload.id);
        return group;
    }
}

export class GroupNotFoundError extends Error {
    constructor(id: string) {
        super(`Group with id '${id}' cannot be found`);
    }
}
