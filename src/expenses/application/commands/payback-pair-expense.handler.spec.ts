import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateDefaultUserGroupExpense,
    generateDefaultUserPairExpense,
} from '@test/helpers/expense/utils';
import { generateDefaultUserRandomGroup } from '@test/helpers/group/utils';
import {
    PaybackPairExpenseCommand,
    PaybackPairExpenseHandler,
} from '@app/expenses/application/commands/payback-pair-expense.handler';

describe('PaybackPairExpenseHandler', () => {
    let sut: PaybackPairExpenseHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyExpenseId = crypto.randomUUID();

    const dummyCommand = new PaybackPairExpenseCommand({
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
        describe('expense is pair expense', () => {
            it('should directly delete the expense', async () => {
                const dummyExpense = generateDefaultUserPairExpense();
                expenseRepo.stub('getActorExpenseById', dummyExpense);

                await sut.execute(dummyCommand);

                expect(dummyExpense.getShareOf(DEFAULT_USER.getId())).toBe(0);
            });
        });

        describe('expense is group expense', () => {
            it("should settle actor's share inside the expense", async () => {
                const dummyGroup = generateDefaultUserRandomGroup();
                const dummyExpense =
                    generateDefaultUserGroupExpense(dummyGroup);

                expenseRepo.stub('getActorExpenseById', dummyExpense);

                await sut.execute(dummyCommand);

                expect(dummyExpense.getShareOf(DEFAULT_USER.getId())).toBe(0);
            });
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new PaybackPairExpenseHandler(expenseRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
    }
});
