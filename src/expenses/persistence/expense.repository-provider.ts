import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';
import { Provider } from '@nestjs/common';

export const expenseRepositoryToken = 'ExpenseRepository';

export const expenseRepositoryProvider: Provider = {
    provide: expenseRepositoryToken,
    useClass: ExpenseInMemoryRepository,
};
