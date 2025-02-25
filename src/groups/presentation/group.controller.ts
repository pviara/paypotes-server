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
import { GetActorGroupByIdQuery } from '@app/groups/application/get-actor-group-by-id.handler';
import { GetActorGroupsQuery } from '@app/groups/application/get-actor-groups.handler';
import { Group } from '@groups/domain/group';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { PageIndexPipe } from '@groups/presentation/pipes/page-index.pipe';
import { SearchPipe } from '@groups/presentation/pipes/search.pipe.ts';
import { User } from '@users/domain/user';
import { UserDTO } from '@users/presentation/user.dto';

export const GROUPS_API_ROUTE = 'groups';

const GroupId = () => Param('id', ParseUUIDPipe);
const PageIndex = () => Query('pageIndex', PageIndexPipe);
const Search = () => Query('search', SearchPipe);

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
            memberIds: group.memberIds,
        });
        return this.commandBus.execute(command);
    }

    @Get(':id')
    async getActorGroupById(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
    ): Promise<GroupDTO> {
        const query = new GetActorGroupByIdQuery({ actorId, groupId });
        const group = await this.queryBus.execute(query);
        return this.mapDTOFrom(group);
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

    private mapDTOFrom(group: Group): GroupDTO {
        return {
            id: group.getId(),
            name: group.getName(),
            emoji: group.getEmoji(),
            members: this.mapUsersDTOFrom(group),
        };
    }

    private mapUsersDTOFrom(group: Group): Array<UserDTO> {
        return group.getMembers().map(this.mapUserDTO());
    }

    private mapUserDTO(): (value: User) => UserDTO {
        return (member: User) => ({
            id: member.getId(),
            firstname: member.getFirstname(),
            lastname: member.getLastname(),
        });
    }

    private mapDTOsFrom(groups: Group[]): GroupDTO[] {
        return groups.map((group) => this.mapDTOFrom(group));
    }
}
