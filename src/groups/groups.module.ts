import { GroupsController } from '@groups/presentation/groups.controller';
import { Module } from '@nestjs/common';

@Module({
    controllers: [GroupsController],
})
export class GroupsModule {}
