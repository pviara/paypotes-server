import { Body, Controller, Post } from '@nestjs/common';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateGroupCommand } from '@groups/application/create-group.handler';

export const GROUPS_API_ROUTE = 'groups';

@Controller(GROUPS_API_ROUTE)
export class GroupController {
    constructor(private commandBus: CommandBus) {}

    @Post()
    create(@Body() { name, emoji, memberIds }: CreateGroupDTO): Promise<void> {
        const command = new CreateGroupCommand(name, emoji, memberIds);
        return this.commandBus.execute(command);
    }
}
