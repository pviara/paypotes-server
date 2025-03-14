import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    GetActorContactExpensesHandler,
    GetActorContactExpensesQuery,
} from '@expenses/application/queries/get-actor-contact-expenses.handler';

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

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorContactExpensesHandler(expenseRepo);
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
});
