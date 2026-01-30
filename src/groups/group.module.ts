import { ContactTaskManagementModule } from '@infra/contact-task-management/contact.task-management.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateGroupHandler } from '@groups/application/create-group.handler';
import { DateModule } from '@app/shared/date/date.module';
import { ExpenseRepositoryModule } from '@expenses/persistence/expense.repository-module';
import { GetActorGroupsHandler } from '@groups/application/get-actor-groups.handler';
import { GetActorGroupsWithBalanceHandler } from '@groups/application/get-actor-groups-with-balance.handler';
import { GetActorGroupWithBalanceByIdHandler } from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { GroupController } from '@groups/presentation/group.controller';
import { GroupRepositoryModule } from '@groups/persistence/group.repository-module';
import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    controllers: [GroupController],
    imports: [
        ContactTaskManagementModule,
        CqrsModule,
        DateModule,
        ExpenseRepositoryModule,
        GroupRepositoryModule,
        UserRepositoryModule,
    ],
    providers: [
        CreateGroupHandler,
        GetActorGroupsHandler,
        GetActorGroupsWithBalanceHandler,
        GetActorGroupWithBalanceByIdHandler,
    ],
})
export class GroupModule {}
