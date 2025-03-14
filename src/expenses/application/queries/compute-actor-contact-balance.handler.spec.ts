import {
    ComputeActorContactBalanceHandler,
    ComputeActorContactBalanceQuery,
} from '@expenses/application/queries/compute-actor-contact-balance.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';

describe('ComputeActorContactBalanceHandler', () => {
    let sut: ComputeActorContactBalanceHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyContactId = crypto.randomUUID();

    const dummyQuery = new ComputeActorContactBalanceQuery({
        actorId: dummyActorId,
        contactId: dummyContactId,
    });

    const dummyStakeholder = new Stakeholder({
        id: dummyContactId,
        firstname: 'Eric',
        lastname: 'Evans',
    });

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new ComputeActorContactBalanceHandler(expenseRepo);
    });

    it("should retrieve the actor's contact expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getAllActorContactExpenses.count).toBe(1);
        expect(
            expenseRepo.calls.getAllActorContactExpenses.history,
        ).toContainEqual([dummyActorId, dummyContactId]);
    });

    it('should compute the actor contact balance correctly', async () => {
        const expenses = [
            createRandomCreditExpense(1500),
            createRandomDebitExpense(790),
            createRandomDebitExpense(2400),
            createRandomCreditExpense(1100),
        ];
        expenseRepo.stub('getAllActorContactExpenses', expenses);

        const balance = await sut.execute(dummyQuery);

        const expectedBalance = 1500 - 790 - 2400 + 1100;
        expect(balance).toBe(expectedBalance);
    });

    function createRandomCreditExpense(balance: number): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: Stakeholder.fromUser(DEFAULT_USER),
            debtor: dummyStakeholder,
        };
        return new PairExpense(metadata, payment);
    }

    function createRandomDebitExpense(balance: number): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: dummyStakeholder,
            debtor: Stakeholder.fromUser(DEFAULT_USER),
        };
        return new PairExpense(metadata, payment);
    }
});
