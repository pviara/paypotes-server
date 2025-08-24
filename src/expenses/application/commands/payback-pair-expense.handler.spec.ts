import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateDefaultUserPairExpense,
    generateRandomBalance,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import { generateRandomUser } from '@test/helpers/user/utils';
import {
    PairExpense,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';
import {
    PaybackPairExpenseCommand,
    PaybackPairExpenseHandler,
} from '@expenses/application/commands/payback-pair-expense.handler';

describe('PaybackPairExpenseHandler', () => {
    let sut: PaybackPairExpenseHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyContactId = crypto.randomUUID();
    const dummyExpenseId = crypto.randomUUID();

    const dummyCommand = new PaybackPairExpenseCommand({
        actorId: dummyActorId,
        contactId: dummyContactId,
        expenseId: dummyExpenseId,
    });

    const dummyExpense = generateDefaultUserPairExpense();

    beforeEach(() => {
        initSut();
        expenseRepo.stub('getActorContactExpenseById', dummyExpense);
    });

    it("should retrieve the actor's expense", async () => {
        await sut.execute(dummyCommand);

        expect(expenseRepo.calls.getActorContactExpenseById.count).toBe(1);
        expect(
            expenseRepo.calls.getActorContactExpenseById.history,
        ).toContainEqual([dummyActorId, dummyContactId, dummyExpenseId]);
    });

    describe('expense does not exist', () => {
        beforeEach(() => {
            expenseRepo.stub('getActorContactExpenseById', null);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                ExpenseNotFoundError,
            );
        });
    });

    describe('expense exists', () => {
        it('should settle all stakeholders share', async () => {
            const dummyExpense = generateRandomCreditExpense();
            expenseRepo.stub('getActorContactExpenseById', dummyExpense);

            await sut.execute(dummyCommand);

            expectAllStakeholdersShareToBeSettled(dummyExpense);
        });

        it('should update expense', async () => {
            await sut.execute(dummyCommand);

            expect(expenseRepo.calls.updatePairExpense.count).toBe(1);
            expect(expenseRepo.calls.updatePairExpense.history).toContainEqual(
                dummyExpense,
            );
        });

        function generateRandomCreditExpense(): PairExpense {
            const metadata = generateRandomMetadata();
            const payment: PairPayment = {
                balance: generateRandomBalance(),
                creditor: DEFAULT_USER,
                debtor: generateRandomUser(),
            };
            return PairExpense.create(metadata, payment);
        }

        function expectAllStakeholdersShareToBeSettled(
            expense: PairExpense,
        ): void {
            const stakeholders = expense.getStakeholders();
            const allStakeholdersShareSettled = stakeholders.every(
                (stakeholder) => stakeholder.getShare() === 0,
            );
            expect(allStakeholdersShareSettled).toBe(true);
        }
    });

    function initSut(): void {
        initDependencies();
        sut = new PaybackPairExpenseHandler(expenseRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
    }
});
