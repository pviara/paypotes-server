import { ExpenseDatabaseRepository } from '@app/expenses/persistence/expense.database-repository';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Provider } from '@nestjs/common';

export const expenseRepositoryProvider: Provider = {
    provide: ExpenseRepository,
    useClass: ExpenseDatabaseRepository,
};
