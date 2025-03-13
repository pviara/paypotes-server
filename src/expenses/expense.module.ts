import { AddPairExpenseHandler } from '@expenses/application/add-pair-expense.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseController } from '@expenses/presentation/expense.controller';
import { expenseRepositoryProvider } from '@expenses/persistence/expense.repository-provider';
import { GetActorContactExpenseByIdHandler } from '@expenses/application/get-actor-contact-expense-by-id.handler';
import { GetActorContactExpensesHandler } from '@expenses/application/get-actor-contact-expenses.handler';
import { GetActorExpenseByIdHandler } from '@expenses/application/get-actor-expense-by-id.handler';
import { GetActorExpensesHandler } from '@expenses/application/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdHandler } from '@expenses/application/get-actor-group-expense-by-id.handler';
import { GetActorGroupExpensesHandler } from '@expenses/application/get-actor-group-expenses.handler';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    controllers: [ExpenseController],
    imports: [CqrsModule, UserModule],
    providers: [
        AddPairExpenseHandler,
        expenseRepositoryProvider,
        GetActorContactExpenseByIdHandler,
        GetActorContactExpensesHandler,
        GetActorExpenseByIdHandler,
        GetActorExpensesHandler,
        GetActorGroupExpenseByIdHandler,
        GetActorGroupExpensesHandler,
    ],
})
export class ExpenseModule {}
