import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseNotFoundError } from '@expenses/application/get-actor-expense-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateDefaultUserPairExpense } from '@test/helpers/expense/utils';
import {
    PaybackExpenseCommand,
    PaybackExpenseHandler,
} from '@expenses/application/payback-expense.handler';

describe('PaybackExpenseHandler', () => {
    let sut: PaybackExpenseHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyExpenseId = crypto.randomUUID();

    const dummyCommand = new PaybackExpenseCommand({
        actorId: dummyActorId,
        expenseId: dummyExpenseId,
    });

    const dummyExpense = generateDefaultUserPairExpense();

    beforeEach(() => {
        initSut();
        expenseRepo.stub('getActorExpenseById', dummyExpense);
    });

    it("should retrieve the actor's expense", async () => {
        await sut.execute(dummyCommand);

        expect(expenseRepo.calls.getActorExpenseById.count).toBe(1);
        expect(expenseRepo.calls.getActorExpenseById.history).toContainEqual([
            dummyActorId,
            dummyExpenseId,
        ]);
    });

    describe('expense does not exist', () => {
        beforeEach(() => {
            expenseRepo.stub('getActorExpenseById', null);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                ExpenseNotFoundError,
            );
        });
    });

    describe('expense exists', () => {
        it('should delete the expense', async () => {
            await sut.execute(dummyCommand);
            expect(expenseRepo.calls.delete.count).toBe(1);
            expect(expenseRepo.calls.delete.history).toContain(
                dummyExpense.getId(),
            );
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new PaybackExpenseHandler(expenseRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
    }
});
