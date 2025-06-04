import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateDefaultUserPairExpense } from '@test/helpers/expense/utils';
import {
    PaybackGroupExpenseCommand,
    PaybackGroupExpenseHandler,
} from '@expenses/application/commands/payback-group-expense.handler';

describe('PaybackGroupExpenseHandler', () => {
    let sut: PaybackGroupExpenseHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyExpenseId = crypto.randomUUID();
    const dummyDebtorIds = [crypto.randomUUID()];

    const dummyCommand = new PaybackGroupExpenseCommand({
        actorId: dummyActorId,
        expenseId: dummyExpenseId,
        debtorIds: dummyDebtorIds,
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

    function initSut(): void {
        initDependencies();
        sut = new PaybackGroupExpenseHandler(expenseRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
    }
});
