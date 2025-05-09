import {
    ComputeActorBalanceHandler,
    ComputeActorBalanceQuery,
} from '@expenses/application/queries/compute-actor-balance.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateDefaultUserRandomGroup,
    generateRandomMembers,
} from '@test/helpers/group/utils';
import {
    generateRandomBoolean,
    generateRandomMetadata,
    generateRandomStakeholder,
} from '@test/helpers/expense/utils';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { Member } from '@app/groups/domain/member';
import { Group } from '@app/groups/domain/group';

describe('ComputeActorBalanceHandler', () => {
    let sut: ComputeActorBalanceHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();

    const dummyGroupMembers: Array<Member> = [
        Member.fromUser(DEFAULT_USER),
        ...generateRandomMembers({ length: 4 }),
    ];

    const dummyGroup = new Group({
        id: crypto.randomUUID(),
        name: 'name',
        emoji: '🚧',
        members: dummyGroupMembers,
    });

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
            createRandomCreditGroupExpense(1500),
            createRandomDebitPairExpense(790),
            createRandomDebitPairExpense(2400),
            createRandomCreditGroupExpense(1100),
        ];
        expenseRepo.stub('getAllActorExpenses', expenses);

        const balance = await sut.execute(dummyQuery);

        const expectedBalance =
            1500 / dummyGroupMembers.length -
            790 -
            2400 +
            1100 / dummyGroupMembers.length;

        expect(balance).toBe(expectedBalance);
    });

    function createRandomCreditGroupExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = Member.fromUser(DEFAULT_USER);

        return new GroupExpense(metadata, dummyGroup, {
            balance,
            creditor,
        });
    }

    function createRandomCreditPairExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = Stakeholder.from(DEFAULT_USER);

        const payment: PairPayment = {
            balance,
            creditor,
            debtor: generateRandomStakeholder(),
        };
        return new PairExpense(metadata, payment);
    }

    function createRandomDebitPairExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = generateRandomStakeholder();

        const payment: PairPayment = {
            balance,
            creditor,
            debtor: Stakeholder.from(DEFAULT_USER),
        };
        return new PairExpense(metadata, payment);
    }
});
