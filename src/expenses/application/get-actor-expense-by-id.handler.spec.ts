import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    ExpenseNotFoundError,
    GetActorExpenseByIdHandler,
    GetActorExpenseByIdQuery,
} from '@expenses/application/get-actor-expense-by-id.handler';
import { generateDefaultUserExpense } from '@test/helpers/expense/utils';

describe('GetActorExpenseByIdHandler', () => {
    let sut: GetActorExpenseByIdHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyExpenseId = crypto.randomUUID();
    const dummyQuery = new GetActorExpenseByIdQuery({
        actorId: dummyActorId,
        expenseId: dummyExpenseId,
    });

    const dummyExpense = generateDefaultUserExpense();

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorExpenseByIdHandler(expenseRepo);

        expenseRepo.stub('getActorExpenseById', dummyExpense);
    });

    it("should retrieve the actor's expense by its id", async () => {
        await sut.execute(dummyQuery);

        expect(expenseRepo.calls.getActorExpenseById.count).toBe(1);
        expect(expenseRepo.calls.getActorExpenseById.history).toContainEqual([
            dummyActorId,
            dummyExpenseId,
        ]);
    });

    it('should return the expense that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyExpense);
    });

    describe("actor's expense doesn't exist", () => {
        it('should throw an error', async () => {
            expenseRepo.stub('getActorExpenseById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                ExpenseNotFoundError,
            );
        });
    });
});
