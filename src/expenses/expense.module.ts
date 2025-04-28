import { AddGroupExpenseHandler } from '@expenses/application/commands/add-group-expense.handler';
import { AddPairExpenseHandler } from '@expenses/application/commands/add-pair-expense.handler';
import { ComputeActorBalanceHandler } from '@expenses/application/queries/compute-actor-balance.handler';
import { ContactTaskMessengerModule } from '@infra/contact-task-managers/contact.task-messenger.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseController } from '@expenses/presentation/expense.controller';
import { ExpenseRepositoryModule } from '@expenses/persistence/expense.repository-module';
import { GetActorContactExpenseByIdHandler } from '@expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { GetActorContactExpensesHandler } from '@expenses/application/queries/get-actor-contact-expenses.handler';
import { GetActorExpenseByIdHandler } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { GetActorExpensesHandler } from '@expenses/application/queries/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdHandler } from '@expenses/application/queries/get-actor-group-expense-by-id.handler';
import { GetActorGroupExpensesHandler } from '@expenses/application/queries/get-actor-group-expenses.handler';
import { GroupRepositoryModule } from '@groups/persistence/group.repository-module';
import { Module } from '@nestjs/common';
import { PaybackExpenseHandler } from '@expenses/application/commands/payback-expense.handler';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    controllers: [ExpenseController],
    imports: [
        ContactTaskMessengerModule,
        CqrsModule,
        ExpenseRepositoryModule,
        GroupRepositoryModule,
        UserRepositoryModule,
    ],
    providers: [
        AddGroupExpenseHandler,
        AddPairExpenseHandler,
        ComputeActorBalanceHandler,
        GetActorContactExpenseByIdHandler,
        GetActorContactExpensesHandler,
        GetActorExpenseByIdHandler,
        GetActorExpensesHandler,
        GetActorGroupExpenseByIdHandler,
        GetActorGroupExpensesHandler,
        PaybackExpenseHandler,
    ],
})
export class ExpenseModule {}
