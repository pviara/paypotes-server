import { Controller, Post } from '@nestjs/common';
import { GroupDTO } from '@groups/presentation/model/group-dto.decorator';

export const GROUPS_API_ROUTE = 'groups';

@Controller(GROUPS_API_ROUTE)
export class GroupsController {
    @Post()
    create(@GroupDTO() group: unknown): void {
        console.log(group);
    }
}
