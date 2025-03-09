import { Expense } from '@app/expenses/domain/expense';
import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';

export class ExpenseInMemoryTestingRepository extends ExpenseInMemoryRepository {
    async empty(): Promise<void> {
        this.expenses = [];
    }

    async insert(...expenses: Array<Expense>): Promise<void> {
        this.expenses.push(...expenses);
    }
}
