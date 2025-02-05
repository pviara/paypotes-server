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
    getById(@GroupId() id: string): Promise<Group[]> {
        const query = new GetGroupByIdQuery(id);
        return this.queryBus.execute(query);
    }
}
