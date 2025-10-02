import {
    calculateExpectedBalanceFor,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import {
    ComputeActorBalanceHandler,
    ComputeActorBalanceQuery,
} from '@expenses/application/queries/compute-actor-balance.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomMembers } from '@test/helpers/group/utils';
import { generateRandomUser } from '@test/helpers/user/utils';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupExpenseBuilder,
} from '@expenses/domain/expense/group/group-expense';
import { Member } from '@groups/domain/member';
import {
    PairExpense,
    PairExpenseBuilder,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';

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
        createdAt: new Date(),
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
            createRandomCreditPairExpense(2400),
            createRandomCreditGroupExpense(1100),
        ];
        expenseRepo.stub('getAllActorExpenses', expenses);

        const balance = await sut.execute(dummyQuery);

        const expectedBalance = calculateExpectedBalanceFor(expenses);
        expect(balance).toBe(expectedBalance);
    });

    function createRandomCreditGroupExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = Member.fromUser(DEFAULT_USER);

        return new GroupExpenseBuilder()
            .withMetadata(metadata)
            .withGroup(dummyGroup)
            .withPayment({
                balance,
                creditor,
            })
            .build();
    }

    function createRandomCreditPairExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = DEFAULT_USER;

        const payment: PairPayment = {
            balance,
            creditor,
            debtor: generateRandomUser(),
        };
        return new PairExpenseBuilder().withMetadata(metadata).withPayment(payment).build()
    }

    function createRandomDebitPairExpense(balance: number): Expense {
        const metadata = generateRandomMetadata();
        const creditor = generateRandomUser();

        const payment: PairPayment = {
            balance,
            creditor,
            debtor: DEFAULT_USER,
        };
        return new PairExpenseBuilder().withMetadata(metadata).withPayment(payment).build()
    }
});
