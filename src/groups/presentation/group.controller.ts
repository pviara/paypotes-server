import { ActorId } from '@auth/presentation/model/actor.decorator';
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
import { GetActorGroupsQuery } from '@groups/application/get-actor-groups.handler';
import { GetActorGroupsWithBalanceQuery } from '@groups/application/get-actor-groups-with-balance.handler';
import { GetActorGroupWithBalanceByIdQuery } from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { Group } from '@groups/domain/group';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { GroupWithBalance } from '@groups/domain/group-with-balance';
import { GroupWithBalanceDTO } from '@groups/presentation/dto/group-with-balance.dto';
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

    @Get('without-balance')
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
        return this.mapGroupDTOsFrom(groups);
    }

    @Get(':id')
    async getActorGroupWithBalanceById(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
    ): Promise<GroupWithBalanceDTO> {
        const query = new GetActorGroupWithBalanceByIdQuery({
            actorId,
            groupId,
        });
        const group = await this.queryBus.execute(query);
        return GroupWithBalanceDTO.from(group);
    }

    @Get()
    async getActorGroupsWithBalance(
        @ActorId() actorId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<GroupDTO[]> {
        const query = new GetActorGroupsWithBalanceQuery({
            actorId,
            pageIndex,
            search,
        });
        const groups = await this.queryBus.execute(query);
        return this.mapGroupWithBalanceDTOsFrom(groups);
    }

    private mapGroupDTOsFrom(groups: Array<Group>): Array<GroupDTO> {
        return groups.map((group) => GroupDTO.from(group));
    }

    private mapGroupWithBalanceDTOsFrom(
        groups: Array<GroupWithBalance>,
    ): Array<GroupWithBalanceDTO> {
        return groups.map((group) => GroupWithBalanceDTO.from(group));
    }
}
