import { CqrsModule } from '@nestjs/cqrs';
import { CreateGroupHandler } from '@groups/application/create-group.handler';
import { GetManyGroupsHandler } from '@groups/application/get-many-groups.handler';
import { GetActorGroupByIdHandler } from '@app/groups/application/get-actor-group-by-id.handler';
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
        GetActorGroupByIdHandler,
        groupRepositoryProvider,
    ],
})
export class GroupModule {}
