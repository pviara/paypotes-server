import {
    GroupExpenseNotFoundError,
    GetActorGroupExpenseByIdHandler,
    GetActorGroupExpenseByIdQuery,
} from '@expenses/application/get-actor-group-expense-by-id.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateDefaultUserExpense } from '@test/helpers/expense/utils';

describe('GetActorGroupExpenseByIdHandler', () => {
    let sut: GetActorGroupExpenseByIdHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroupId = crypto.randomUUID();
    const dummyExpenseId = crypto.randomUUID();

    const dummyQuery = new GetActorGroupExpenseByIdQuery({
        actorId: dummyActorId,
        groupId: dummyGroupId,
        expenseId: dummyExpenseId,
    });

    const dummyExpense = generateDefaultUserExpense();

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorGroupExpenseByIdHandler(expenseRepo);

        expenseRepo.stub('getActorGroupExpenseById', dummyExpense);
    });

    it("should retrieve the actor's group expense by its id", async () => {
        await sut.execute(dummyQuery);

        expect(expenseRepo.calls.getActorGroupExpenseById.count).toBe(1);
        expect(
            expenseRepo.calls.getActorGroupExpenseById.history,
        ).toContainEqual([dummyActorId, dummyGroupId, dummyExpenseId]);
    });

    it('should return the expense that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyExpense);
    });

    describe("actor's group expense doesn't exist", () => {
        it('should throw an error', async () => {
            expenseRepo.stub('getActorGroupExpenseById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                GroupExpenseNotFoundError,
            );
        });
    });
});
