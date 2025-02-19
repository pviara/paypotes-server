import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';

export class GetManyGroupsQuery implements IQuery {}

@QueryHandler(GetManyGroupsQuery)
export class GetManyGroupsHandler implements IQueryHandler<GetManyGroupsQuery> {
    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,
    ) {}

    async execute(query: GetManyGroupsQuery): Promise<Group[]> {
        return this.groupRepository.getMany();
    }
}
