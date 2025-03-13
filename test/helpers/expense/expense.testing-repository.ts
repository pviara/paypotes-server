import { Expense } from '@app/expenses/domain/expense';
import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';

export class ExpenseInMemoryTestingRepository extends ExpenseInMemoryRepository {
    async empty(): Promise<void> {
        this.expenses = [];
    }

    expenseSaved(expenseId: string): boolean {
        return this.expenses.some((expense) => expense.getId() === expenseId);
    }

    async insert(...expenses: Array<Expense>): Promise<void> {
        this.expenses.push(...expenses);
    }
}
