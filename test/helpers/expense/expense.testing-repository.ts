import { AnyKindOfExpense } from '@expenses/domain/any-expense';
import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';

export class ExpenseInMemoryTestingRepository extends ExpenseInMemoryRepository {
    async empty(): Promise<void> {
        this.expenses = [];
    }

    async insert(...expenses: Array<AnyKindOfExpense>): Promise<void> {
        this.expenses.push(...expenses);
    }
}
