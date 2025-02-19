import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGroupCommand } from '@groups/application/create-group.handler';
import { GetGroupByIdQuery } from '@groups/application/get-group-by-id.handler';
import { Group } from '@groups/domain/group';
import { User } from '@users/domain/user';
import { GetManyGroupsQuery } from '@groups/application/get-many-groups.handler';

export const GROUPS_API_ROUTE = 'groups';

const GroupId = (): ParameterDecorator => Param('id', ParseUUIDPipe);

@Controller(GROUPS_API_ROUTE)
export class GroupController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {}

    @Post()
    create(
        @Body() { id, name, emoji, memberIds }: CreateGroupDTO,
    ): Promise<void> {
        const command = new CreateGroupCommand(id, name, emoji, memberIds);
        return this.commandBus.execute(command);
    }

    @Get(':id')
    async getById(@GroupId() id: string): Promise<GroupDTO> {
        const query = new GetGroupByIdQuery(id);
        const group = await this.queryBus.execute<typeof query, Group>(query);
        return this.mapDTOFrom(group);
    }

    @Get()
    async getMany(): Promise<GroupDTO[]> {
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

type GroupDTO = {
    id: string;
    name: string;
    emoji: string;
    members: Array<UserDTO>;
};

type UserDTO = {
    id: string;
    firstname: string;
    lastname: string;
};
