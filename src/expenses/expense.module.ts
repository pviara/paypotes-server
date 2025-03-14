import { AddGroupExpenseHandler } from '@app/expenses/application/commands/add-group-expense.handler';
import { AddPairExpenseHandler } from '@app/expenses/application/commands/add-pair-expense.handler';
import { ComputeActorContactBalanceHandler } from '@expenses/application/queries/compute-actor-contact-balance.handler';
import { ComputeActorGroupBalanceHandler } from '@expenses/application/queries/compute-actor-group-balance.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseController } from '@expenses/presentation/expense.controller';
import { expenseRepositoryProvider } from '@expenses/persistence/expense.repository-provider';
import { GetActorContactExpenseByIdHandler } from '@app/expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { GetActorContactExpensesHandler } from '@app/expenses/application/queries/get-actor-contact-expenses.handler';
import { GetActorExpenseByIdHandler } from '@app/expenses/application/queries/get-actor-expense-by-id.handler';
import { GetActorExpensesHandler } from '@app/expenses/application/queries/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdHandler } from '@app/expenses/application/queries/get-actor-group-expense-by-id.handler';
import { GetActorGroupExpensesHandler } from '@app/expenses/application/queries/get-actor-group-expenses.handler';
import { GroupModule } from '@groups/group.module';
import { Module } from '@nestjs/common';
import { PaybackExpenseHandler } from '@expenses/application/commands/payback-expense.handler';
import { UserModule } from '@users/user.module';

@Module({
    controllers: [ExpenseController],
    imports: [CqrsModule, GroupModule, UserModule],
    providers: [
        AddGroupExpenseHandler,
        AddPairExpenseHandler,
        ComputeActorContactBalanceHandler,
        ComputeActorGroupBalanceHandler,
        expenseRepositoryProvider,
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
