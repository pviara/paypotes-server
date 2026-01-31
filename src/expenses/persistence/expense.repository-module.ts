import { DatabaseModule } from '@infra/database/database.module';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryProvider } from '@expenses/persistence/expense.repository-provider';
import { GroupRepositoryModule } from '@groups/persistence/group.repository-module';
import { Module } from '@nestjs/common';

@Module({
    exports: [ExpenseRepository],
    imports: [DatabaseModule, GroupRepositoryModule],
    providers: [expenseRepositoryProvider],
})
export class ExpenseRepositoryModule {}
