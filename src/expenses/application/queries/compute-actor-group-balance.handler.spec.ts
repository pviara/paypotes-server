import {
    ComputeActorGroupBalanceHandler,
    ComputeActorGroupBalanceQuery,
} from '@expenses/application/queries/compute-actor-group-balance.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomMembers } from '@test/helpers/group/utils';
import {
    generateRandomMetadata,
    generateRandomStakeholder,
} from '@test/helpers/expense/utils';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder';

describe('ComputeActorGroupBalanceHandler', () => {
    let sut: ComputeActorGroupBalanceHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroupId = crypto.randomUUID();

    const dummyQuery = new ComputeActorGroupBalanceQuery({
        actorId: dummyActorId,
        groupId: dummyGroupId,
    });

    const dummyGroup = new Group({
        id: dummyGroupId,
        name: 'Fun at hospital',
        emoji: '⛑️',
        members: [Member.fromUser(DEFAULT_USER), ...generateRandomMembers()],
    });

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new ComputeActorGroupBalanceHandler(expenseRepo);
    });

    it("should retrieve the actor's group expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getAllActorGroupExpenses.count).toBe(1);
        expect(
            expenseRepo.calls.getAllActorGroupExpenses.history,
        ).toContainEqual([dummyActorId, dummyGroupId]);
    });

    it('should compute the actor group balance correctly', async () => {
        const expenses = [
            createRandomCreditExpense(650),
            createRandomDebitExpense(380),
            createRandomDebitExpense(2105),
            createRandomCreditExpense(1300),
        ];
        expenseRepo.stub('getAllActorGroupExpenses', expenses);

        const balance = await sut.execute(dummyQuery);

        const expectedBalance = 650 - 380 - 2105 + 1300;
        expect(balance).toBe(expectedBalance);
    });

    function createRandomCreditExpense(balance: number): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance,
            creditor: Stakeholder.fromUser(DEFAULT_USER),
        };
        return new GroupExpense(metadata, dummyGroup, payment);
    }

    function createRandomDebitExpense(balance: number): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance,
            creditor: generateRandomStakeholder(),
        };
        return new GroupExpense(metadata, dummyGroup, payment);
    }
});
