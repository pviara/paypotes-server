import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { generateDefaultUserPairExpense } from '@test/helpers/expense/utils';

describe('Concurrency tests on adding an expense', () => {
    const repository = new ExpenseInMemoryRepository();

    const dummyActorId = DEFAULT_USER.getId();

    it.concurrent.each(['1', '2', '3', '4'])('Concurrent n%s', () => {});

    // it('should expose inconsistent state when multiple threads add an expense concurrently', async () => {
    //     const promises: Promise<void>[] = Array.from({ length: 5_000_000 }).map(
    //         () => {
    //             return new Promise((resolve) => {
    //                 const delay = Math.random() * 10;
    //                 setTimeout(async () => {
    //                     const dummyExpense = generateDefaultUserPairExpense();
    //                     await repository.save(dummyExpense);
    //                     resolve();
    //                 }, delay);
    //             });
    //         },
    //     );

    //     await Promise.all(promises);

    //     const expenses = await repository.getAllActorExpenses(dummyActorId);
    //     const uniqueExpenses = new Set(expenses.map((e) => e.getId()));

    //     expect(expenses.length).not.toBe(uniqueExpenses.size);
    // });
});
