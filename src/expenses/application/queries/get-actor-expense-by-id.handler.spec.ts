import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    ExpenseNotFoundError,
    GetActorExpenseByIdHandler,
    GetActorExpenseByIdQuery,
} from '@expenses/application/queries/get-actor-expense-by-id.handler';
import {
    generateDefaultUserGroupExpense,
    generateDefaultUserPairExpense,
} from '@test/helpers/expense/utils';
import { generateDefaultUserRandomGroup } from '@test/helpers/group/utils';
import { GroupExpenseSnapshot } from '@expenses/domain/group-expense/group-expense-snapshot';
import { PairExpenseSnapshot } from '@expenses/domain/pair-expense/pair-expense-snapshot';

describe('GetActorExpenseByIdHandler', () => {
    let sut: GetActorExpenseByIdHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyExpenseId = crypto.randomUUID();
    const dummyQuery = new GetActorExpenseByIdQuery({
        actorId: dummyActorId,
        expenseId: dummyExpenseId,
    });

    const dummyExpense = generateDefaultUserPairExpense();

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

    describe('retrieved expense is a pair expense', () => {
        it('should return the expense that was retrieved', async () => {
            const result = await sut.execute(dummyQuery);
            expect(result).toStrictEqual(
                PairExpenseSnapshot.from(dummyExpense, dummyActorId),
            );
        });
    });

    describe('retrieved expense is a group expense', () => {
        const dummyGroup = generateDefaultUserRandomGroup();
        const dummyExpense = generateDefaultUserGroupExpense(dummyGroup);

        it('should return the expense that was retrieved', async () => {
            expenseRepo.stub('getActorExpenseById', dummyExpense);

            const result = await sut.execute(dummyQuery);
            expect(result).toStrictEqual(
                GroupExpenseSnapshot.from(dummyExpense, dummyActorId),
            );
        });
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
