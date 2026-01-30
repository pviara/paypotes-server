import { AddGroupExpenseHandler } from '@expenses/application/commands/add-group-expense.handler';
import { AddPairExpenseHandler } from '@expenses/application/commands/add-pair-expense.handler';
import { ComputeActorBalanceHandler } from '@expenses/application/queries/compute-actor-balance.handler';
import { ContactTaskManagementModule } from '@infra/contact-task-management/contact.task-management.module';
import { CqrsModule } from '@nestjs/cqrs';
import { DateModule } from '@app/shared/date/date.module';
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
import { PaybackGroupExpenseHandler } from '@expenses/application/commands/payback-group-expense.handler';
import { PaybackPairExpenseHandler } from '@expenses/application/commands/payback-pair-expense.handler';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    controllers: [ExpenseController],
    imports: [
        ContactTaskManagementModule,
        CqrsModule,
        DateModule,
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
        PaybackGroupExpenseHandler,
        PaybackPairExpenseHandler,
    ],
})
export class ExpenseModule {}
