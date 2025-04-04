import { ActorId } from '@test/doubles/auth/actor.decorator';
import { AuthGuard } from '@auth/auth-guard.decorator';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { CreateGroupCommand } from '@groups/application/create-group.handler';
import { GetActorGroupWithBalanceByIdQuery } from '@app/groups/application/get-actor-group-with-balance-by-id.handler';
import { GetActorGroupsQuery } from '@groups/application/get-actor-groups.handler';
import { Group } from '@groups/domain/group';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { Member } from '@groups/domain/member';
import { MemberDTO } from '@groups/presentation/dto/member.dto';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { Search } from '@app/shared/decorators/search.query-decorator';

export const GROUPS_API_ROUTE = 'groups';

const GroupId = () => Param('id', ParseUUIDPipe);

@AuthGuard()
@Controller(GROUPS_API_ROUTE)
export class GroupController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {}

    @Post()
    create(@Body() group: CreateGroupDTO): Promise<void> {
        const command = new CreateGroupCommand({
            id: group.id,
            name: group.name,
            emoji: group.emoji,
            userIds: group.userIds,
        });
        return this.commandBus.execute(command);
    }

    @Get(':id')
    async getActorGroupById(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
    ): Promise<GroupDTO> {
        const query = new GetActorGroupWithBalanceByIdQuery({
            actorId,
            groupId,
        });
        const group = await this.queryBus.execute(query);
        return GroupDTO.from(group);
    }

    @Get()
    async getActorGroups(
        @ActorId() actorId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<GroupDTO[]> {
        const query = new GetActorGroupsQuery({
            actorId,
            pageIndex,
            search,
        });
        const groups = await this.queryBus.execute(query);
        return this.mapDTOsFrom(groups);
    }

    private mapDTOsFrom(groups: Array<Group>): Array<GroupDTO> {
        return groups.map((group) => GroupDTO.from(group));
    }
}
