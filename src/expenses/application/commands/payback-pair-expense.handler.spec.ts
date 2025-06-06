import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateDefaultUserPairExpense,
    generateRandomBalance,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import { generateRandomUser } from '@test/helpers/user/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
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
        describe('actor is debtor', () => {
            it("should settle actor's share", async () => {
                const dummyExpense = generateRandomDebitExpense();
                expenseRepo.stub('getActorContactExpenseById', dummyExpense);

                await sut.execute(dummyCommand);

                expect(dummyExpense.getShareOf(dummyActorId)).toBe(0);

                const counterparty =
                    dummyExpense.getCounterpartyOf(dummyActorId);
                expect(counterparty.getShare()).not.toBe(0);
            });

            function generateRandomDebitExpense(): PairExpense {
                const metadata = generateRandomMetadata();
                const payment: PairPayment = {
                    balance: 1000,
                    creditor: generateRandomUser(),
                    debtor: DEFAULT_USER,
                };
                return new PairExpense(metadata, payment);
            }
        });

        describe('actor is creditor', () => {
            it("should settle counterparty's share", async () => {
                const dummyExpense = generateRandomCreditExpense();
                expenseRepo.stub('getActorContactExpenseById', dummyExpense);

                await sut.execute(dummyCommand);

                const counterparty =
                    dummyExpense.getCounterpartyOf(dummyActorId);
                expect(counterparty.getShare()).toBe(0);

                expect(dummyExpense.getShareOf(dummyActorId)).not.toBe(0);
            });

            function generateRandomCreditExpense(): PairExpense {
                const metadata = generateRandomMetadata();
                const payment: PairPayment = {
                    balance: generateRandomBalance(),
                    creditor: DEFAULT_USER,
                    debtor: generateRandomUser(),
                };
                return new PairExpense(metadata, payment);
            }
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
