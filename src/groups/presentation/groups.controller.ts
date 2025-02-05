import { Body, Controller, Post } from '@nestjs/common';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';

export const GROUPS_API_ROUTE = 'groups';

@Controller(GROUPS_API_ROUTE)
export class GroupsController {
    @Post()
    create(@Body() group: CreateGroupDTO): void {}
}
