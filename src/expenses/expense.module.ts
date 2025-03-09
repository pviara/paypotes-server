import { CqrsModule } from '@nestjs/cqrs';
import { ExpenseController } from '@expenses/presentation/expense.controller';
import { expenseRepositoryProvider } from '@expenses/persistence/expense.repository-provider';
import { GetActorExpensesHandler } from '@expenses/application/get-actor-expenses.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ExpenseController],
    imports: [CqrsModule],
    providers: [expenseRepositoryProvider, GetActorExpensesHandler],
})
export class ExpenseModule {}
