import { ExpensePostgresRepository } from '@expenses/persistence/expense.postgres-repository';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Provider } from '@nestjs/common';

export const expenseRepositoryProvider: Provider = {
    provide: ExpenseRepository,
    useClass: ExpensePostgresRepository,
};
