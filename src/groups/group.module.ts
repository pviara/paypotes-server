import { GroupController } from '@groups/presentation/group.controller';
import { Module } from '@nestjs/common';

@Module({
    controllers: [GroupController],
})
export class GroupModule {}
