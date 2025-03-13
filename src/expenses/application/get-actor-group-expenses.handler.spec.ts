import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    GetActorGroupExpensesHandler,
    GetActorGroupExpensesQuery,
} from '@expenses/application/get-actor-group-expenses.handler';

describe('GetActorGroupExpensesHandler', () => {
    let sut: GetActorGroupExpensesHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroupId = crypto.randomUUID();
    const dummyPageIndex = 0;
    const dummySearch = 'an expense label';

    const dummyQuery = new GetActorGroupExpensesQuery({
        actorId: dummyActorId,
        groupId: dummyGroupId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorGroupExpensesHandler(expenseRepo);
    });

    describe('execute', () => {
        it("should retrieve the actor's group expenses", async () => {
            await sut.execute(dummyQuery);
            expect(expenseRepo.calls.getActorGroupExpenses.count).toBe(1);
            expect(
                expenseRepo.calls.getActorGroupExpenses.history,
            ).toContainEqual([
                dummyActorId,
                dummyGroupId,
                dummyPageIndex,
                dummySearch,
            ]);
        });
    });
});
