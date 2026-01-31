import { DatabaseModule } from '@infra/database/database.module';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryProvider } from '@groups/persistence/group.repository-provider';
import { Module } from '@nestjs/common';

@Module({
    exports: [GroupRepository],
    imports: [DatabaseModule],
    providers: [groupRepositoryProvider],
})
export class GroupRepositoryModule {}
