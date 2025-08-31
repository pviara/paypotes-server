import { ExpensePostgresRepository } from '@expenses/persistence/expense.postgres-repository';
import { Provider } from '@nestjs/common';

export const expenseRepositoryToken = 'ExpenseRepository';

export const expenseRepositoryProvider: Provider = {
    provide: expenseRepositoryToken,
    useClass: ExpensePostgresRepository,
};
