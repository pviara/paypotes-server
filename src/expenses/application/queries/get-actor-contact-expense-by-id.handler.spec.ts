import {
    ContactExpenseNotFoundError,
    GetActorContactExpenseByIdHandler,
    GetActorContactExpenseByIdQuery,
} from '@expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateDefaultUserPairExpense } from '@test/helpers/expense/utils';
import { PairExpenseSnapshot } from '@expenses/domain/pair-expense-snapshot';

describe('GetActorContactExpenseByIdHandler', () => {
    let sut: GetActorContactExpenseByIdHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyContactId = crypto.randomUUID();
    const dummyExpenseId = crypto.randomUUID();

    const dummyQuery = new GetActorContactExpenseByIdQuery({
        actorId: dummyActorId,
        contactId: dummyContactId,
        expenseId: dummyExpenseId,
    });

    const dummyExpense = generateDefaultUserPairExpense();

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorContactExpenseByIdHandler(expenseRepo);

        expenseRepo.stub('getActorContactExpenseById', dummyExpense);
    });

    it("should retrieve the actor's contact expense by its id", async () => {
        await sut.execute(dummyQuery);

        expect(expenseRepo.calls.getActorContactExpenseById.count).toBe(1);
        expect(
            expenseRepo.calls.getActorContactExpenseById.history,
        ).toContainEqual([dummyActorId, dummyContactId, dummyExpenseId]);
    });

    it('should return the expense that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(
            PairExpenseSnapshot.from(dummyExpense, dummyActorId),
        );
    });

    describe("actor's contact expense doesn't exist", () => {
        it('should throw an error', async () => {
            expenseRepo.stub('getActorContactExpenseById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                ContactExpenseNotFoundError,
            );
        });
    });
});
