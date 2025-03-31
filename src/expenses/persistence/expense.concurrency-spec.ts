import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import {
    ExpenseInMemoryRepository,
    ExpenseRepository,
} from '@expenses/persistence/expense.repository';
import { generateDefaultUserPairExpense } from '@test/helpers/expense/utils';
import { setTimeout } from 'timers/promises';
import { Expense } from '../domain/expense';

describe('Concurrency tests on adding an expense', () => {
    const dummyActorId = DEFAULT_USER.getId();
    const cases = Array.from({ length: 1 });

    it.concurrent.each(cases)(
        'should expose inconsistent state when multiple expenses are added concurrently',
        async () => {
            const repository = new ExpenseInMemoryRepository();
            const creations = 100;

            const promises = Array.from({ length: creations }).map(() =>
                saveExpenseAfterTimeout(repository),
            );
            await Promise.all(promises);

            const expenses = await repository.getAllActorExpenses(dummyActorId);
            const uniques = new Set(expenses.map((e) => e.getId()));

            expect(uniques.size).not.toBe(creations);
        },
    );

    async function saveExpenseAfterTimeout(repository: ExpenseRepository) {
        await setTimeout(Math.random() * 10);

        const expense = generateDefaultUserPairExpense();
        await repository.save(expense);
    }
});
