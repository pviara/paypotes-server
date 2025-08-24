import {
    expenseRepositoryProvider,
    expenseRepositoryToken,
} from '@expenses/persistence/expense.repository-provider';
import { GroupRepositoryModule } from '@groups/persistence/group.repository-module';
import { Module } from '@nestjs/common';

@Module({
    exports: [expenseRepositoryToken],
    imports: [GroupRepositoryModule],
    providers: [expenseRepositoryProvider],
})
export class ExpenseRepositoryModule {}
