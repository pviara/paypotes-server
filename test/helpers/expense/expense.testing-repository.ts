import { AnyKindOfExpense } from '@expenses/domain/any-expense';
import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';

export class ExpenseInMemoryTestingRepository extends ExpenseInMemoryRepository {
    async empty(): Promise<void> {
        this.expenses = [];
    }

    expenseSaved(expenseId: string): boolean {
        return this.expenses.some((expense) => expense.getId() === expenseId);
    }

    async insert(...expenses: Array<AnyKindOfExpense>): Promise<void> {
        this.expenses.push(...expenses);
    }
}
