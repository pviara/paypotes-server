import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseController } from '@expenses/presentation/expense.controller';
import { expenseRepositoryProvider } from '@expenses/persistence/expense.repository-provider';
import { GetActorExpenseByIdHandler } from '@expenses/application/get-actor-expense-by-id.handler';
import { GetActorExpensesHandler } from '@expenses/application/get-actor-expenses.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ExpenseController],
    imports: [CqrsModule],
    providers: [
        expenseRepositoryProvider,
        GetActorExpenseByIdHandler,
        GetActorExpensesHandler,
    ],
})
export class ExpenseModule {}
