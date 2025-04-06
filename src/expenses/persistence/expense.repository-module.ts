import {
    expenseRepositoryProvider,
    expenseRepositoryToken,
} from '@expenses/persistence/expense.repository-provider';
import { Module } from '@nestjs/common';

@Module({
    exports: [expenseRepositoryToken],
    providers: [expenseRepositoryProvider],
})
export class ExpenseRepositoryModule {}
