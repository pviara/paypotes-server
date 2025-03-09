import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    GetActorExpensesHandler,
    GetActorExpensesQuery,
} from '@expenses/application/get-actor-expenses.handler';

describe('GetActorExpensesHandler', () => {
    let sut: GetActorExpensesHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyPageIndex = 0;
    const dummySearch = 'a group name';

    const dummyQuery = new GetActorExpensesQuery({
        actorId: dummyActorId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorExpensesHandler(expenseRepo);
    });

    describe('execute', () => {
        it("should retrieve the actor's expenses", async () => {
            await sut.execute(dummyQuery);
            expect(expenseRepo.calls.getActorExpenses.count).toBe(1);
            expect(expenseRepo.calls.getActorExpenses.history).toContainEqual([
                dummyActorId,
                dummyPageIndex,
                dummySearch,
            ]);
        });
    });
});
