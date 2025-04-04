import { CqrsModule } from '@nestjs/cqrs';
import { CreateGroupHandler } from '@groups/application/create-group.handler';
import { GetActorGroupsHandler } from '@groups/application/get-actor-groups.handler';
import { GetActorGroupWithBalanceByIdHandler } from '@app/groups/application/get-actor-group-with-balance-by-id.handler';
import { GroupController } from '@groups/presentation/group.controller';
import {
    groupRepositoryProvider,
    groupRepositoryToken,
} from '@groups/persistence/group.repository-provider';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    controllers: [GroupController],
    exports: [groupRepositoryToken],
    imports: [CqrsModule, UserModule],
    providers: [
        CreateGroupHandler,
        GetActorGroupsHandler,
        GetActorGroupWithBalanceByIdHandler,
        groupRepositoryProvider,
    ],
})
export class GroupModule {}
