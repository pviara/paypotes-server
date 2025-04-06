import {
    groupRepositoryProvider,
    groupRepositoryToken,
} from '@groups/persistence/group.repository-provider';
import { Module } from '@nestjs/common';

@Module({
    exports: [groupRepositoryToken],
    providers: [groupRepositoryProvider],
})
export class GroupRepositoryModule {}
