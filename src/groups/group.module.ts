import { CqrsModule } from '@nestjs/cqrs';
import { CreateGroupHandler } from '@groups/application/create-group.handler';
import { GetManyGroupsHandler } from '@groups/application/get-many-groups.handler';
import { GetGroupByIdHandler } from '@groups/application/get-group-by-id.handler';
import { GroupController } from '@groups/presentation/group.controller';
import { groupRepositoryProvider } from '@groups/persistence/group.repository-provider';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    controllers: [GroupController],
    imports: [CqrsModule, UserModule],
    providers: [
        CreateGroupHandler,
        GetManyGroupsHandler,
        GetGroupByIdHandler,
        groupRepositoryProvider,
    ],
})
export class GroupModule {}
