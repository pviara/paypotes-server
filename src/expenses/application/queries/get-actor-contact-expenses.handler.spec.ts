import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateDefaultUserPairExpenses } from '@test/helpers/expense/utils';
import {
    GetActorContactExpensesHandler,
    GetActorContactExpensesQuery,
} from '@expenses/application/queries/get-actor-contact-expenses.handler';
import { PairExpenseSnapshots } from '@expenses/domain/pair-expense-snapshot';

describe('GetActorContactExpensesHandler', () => {
    let sut: GetActorContactExpensesHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyContactId = crypto.randomUUID();
    const dummyPageIndex = 0;
    const dummySearch = 'an expense label';

    const dummyQuery = new GetActorContactExpensesQuery({
        actorId: dummyActorId,
        contactId: dummyContactId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    const dummyExpenses = generateDefaultUserPairExpenses({ length: 10 });

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorContactExpensesHandler(expenseRepo);

        expenseRepo.stub('getActorContactExpenses', dummyExpenses);
    });

    it("should retrieve the actor's contact expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getActorContactExpenses.count).toBe(1);
        expect(
            expenseRepo.calls.getActorContactExpenses.history,
        ).toContainEqual([
            dummyActorId,
            dummyContactId,
            dummyPageIndex,
            dummySearch,
        ]);
    });

    it('should return the expenses that were retrieved', async () => {
        const result = await sut.execute(dummyQuery);

        expect(result).toStrictEqual(
            PairExpenseSnapshots.from(dummyExpenses, dummyActorId),
        );
    });
});
