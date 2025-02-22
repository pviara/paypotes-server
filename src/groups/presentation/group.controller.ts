import { Actor } from '@test/doubles/auth/actor.decorator';
import { AuthGuard } from '@auth/auth-guard.decorator';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { CreateGroupCommand } from '@groups/application/create-group.handler';
import { GetGroupByIdQuery } from '@groups/application/get-group-by-id.handler';
import { GetManyGroupsQuery } from '@groups/application/get-many-groups.handler';
import { Group } from '@groups/domain/group';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { User } from '@users/domain/user';
import { UserDTO } from '@users/presentation/user.dto';

export const GROUPS_API_ROUTE = 'groups';

const GroupId = (): ParameterDecorator => Param('id', ParseUUIDPipe);

@Controller(GROUPS_API_ROUTE)
@AuthGuard()
export class GroupController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {}

    @Post()
    create(@Actor() actor: User, @Body() dto: CreateGroupDTO): Promise<void> {
        const command = new CreateGroupCommand(
            dto.id,
            dto.name,
            dto.emoji,
            dto.memberIds,
        );
        return this.commandBus.execute(command);
    }

    @Get(':id')
    async getById(
        @Actor() actor: User,
        @GroupId() id: string,
    ): Promise<GroupDTO> {
        const query = new GetGroupByIdQuery({ actor, id });
        const group = await this.queryBus.execute<typeof query, Group>(query);
        return this.mapDTOFrom(group);
    }

    @Get()
    async getMany(@Actor() actor: User): Promise<GroupDTO[]> {
        const query = new GetManyGroupsQuery();
        const groups = await this.queryBus.execute<typeof query, Group[]>(
            query,
        );
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
