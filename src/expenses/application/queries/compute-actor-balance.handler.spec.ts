import {
    ComputeActorBalanceHandler,
    ComputeActorBalanceQuery,
} from '@expenses/application/queries/compute-actor-balance.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateRandomBoolean,
    generateRandomMetadata,
    generateRandomStakeholder,
} from '@test/helpers/expense/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { Expense } from '@expenses/domain/expense';
import { generateDefaultUserRandomGroup } from '@test/helpers/group/utils';

describe('ComputeActorBalanceHandler', () => {
    let sut: ComputeActorBalanceHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyContactId = crypto.randomUUID();

    const dummyQuery = new ComputeActorBalanceQuery({
        actorId: dummyActorId,
    });

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new ComputeActorBalanceHandler(expenseRepo);
    });

    it("should retrieve the actor's expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getAllActorExpenses.count).toBe(1);
        expect(expenseRepo.calls.getAllActorExpenses.history).toContain(
            dummyActorId,
        );
    });

    it('should compute the actor balance correctly', async () => {
        const expenses = [
            createRandomCreditExpense(1500),
            createRandomDebitExpense(790),
            createRandomDebitExpense(2400),
            createRandomCreditExpense(1100),
        ];
        expenseRepo.stub('getAllActorExpenses', expenses);

        const balance = await sut.execute(dummyQuery);

        const expectedBalance = 1500 - 790 - 2400 + 1100;
        expect(balance).toBe(expectedBalance);
    });

    function createRandomCreditExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = Stakeholder.fromUser(DEFAULT_USER);

        if (generateRandomBoolean()) {
            return new PairExpense(metadata, {
                balance,
                creditor,
                debtor: generateRandomStakeholder(),
            });
        }

        const dummyGroup = generateDefaultUserRandomGroup();
        return new GroupExpense(metadata, dummyGroup, {
            balance,
            creditor,
        });
    }

    function createRandomDebitExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = generateRandomStakeholder();

        if (generateRandomBoolean()) {
            const payment: PairPayment = {
                balance,
                creditor,
                debtor: Stakeholder.fromUser(DEFAULT_USER),
            };
            return new PairExpense(metadata, payment);
        }

        const dummyGroup = generateDefaultUserRandomGroup();
        const payment: GroupPayment = { balance, creditor };
        return new GroupExpense(metadata, dummyGroup, payment);
    }

    // function createRandomCreditExpense(balance: number): PairExpense {
    //     const metadata = generateRandomMetadata();
    //     const payment: PairPayment = {
    //         balance,
    //         creditor: Stakeholder.fromUser(DEFAULT_USER),
    //         debtor: generateRandomStakeholder(),
    //     };
    //     return new PairExpense(metadata, payment);
    // }

    // function createRandomDebitExpense(balance: number): PairExpense {
    //     const metadata = generateRandomMetadata();
    //     const payment: PairPayment = {
    //         balance,
    //         creditor: dummyStakeholder,
    //         debtor: Stakeholder.fromUser(DEFAULT_USER),
    //     };
    //     return new PairExpense(metadata, payment);
    // }
});
function generateRandomGroup() {
    throw new Error('Function not implemented.');
}
