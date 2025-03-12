import { SimpleExpense } from '@app/expenses/domain/simple-expense';
import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';

export class ExpenseInMemoryTestingRepository extends ExpenseInMemoryRepository {
    async empty(): Promise<void> {
        this.expenses = [];
    }

    async insert(...expenses: Array<SimpleExpense>): Promise<void> {
        this.expenses.push(...expenses);
    }
}
