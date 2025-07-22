import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import {
    GetActorGroupWithBalanceByIdHandler,
    GetActorGroupWithBalanceByIdQuery,
    GroupNotFoundError,
} from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/group-expense/group-expense';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';
import { generateRandomMembers } from '@test/helpers/group/utils';
import { Member } from '@groups/domain/member';

describe('GetActorGroupWithBalanceByIdHandler', () => {
    let sut: GetActorGroupWithBalanceByIdHandler;

    let groupRepo: GroupRepositorySpy;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroupId = crypto.randomUUID();
    const dummyQuery = new GetActorGroupWithBalanceByIdQuery({
        actorId: dummyActorId,
        groupId: dummyGroupId,
    });

    const dummyGroupMembers: Array<Member> = [
        Member.fromUser(DEFAULT_USER),
        ...generateRandomMembers({ length: 4 }),
    ];

    const dummyGroup = new Group({
        id: dummyGroupId,
        name: 'name',
        emoji: '🚧',
        members: dummyGroupMembers,
    });

    beforeEach(() => {
        initSut();
        groupRepo.stub('getActorGroupById', dummyGroup);
    });

    it("should retrieve the actor's group by its id", async () => {
        await sut.execute(dummyQuery);

        expect(groupRepo.calls.getActorGroupById.count).toBe(1);
        expect(groupRepo.calls.getActorGroupById.history).toContainEqual([
            dummyActorId,
            dummyGroupId,
        ]);
    });

    it("should retrieve the actor's group expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getAllActorGroupExpenses.count).toBe(1);
        expect(
            expenseRepo.calls.getAllActorGroupExpenses.history,
        ).toContainEqual([dummyActorId, dummyGroupId]);
    });

    it("should compute the actor's group balance correctly", async () => {
        const expenses = [
            createRandomCreditExpense(1500),
            createRandomDebitExpense(790),
            createRandomDebitExpense(2400),
            createRandomCreditExpense(1100),
        ];
        expenseRepo.stub('getAllActorGroupExpenses', expenses);

        const group = await sut.execute(dummyQuery);

        const members = dummyGroupMembers.length;
        const credit_1 = (1500 / members) * (members - 1);
        const debit_1 = 790 / members;
        const debit_2 = 2400 / members;
        const credit_2 = (1100 / members) * (members - 1);

        const expectedBalance = credit_1 - debit_1 - debit_2 + credit_2;
        expect(group.getBalance()).toBe(expectedBalance);
    });

    describe("actor's group doesn't exist", () => {
        it('should throw an error', async () => {
            groupRepo.stub('getActorGroupById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                GroupNotFoundError,
            );
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new GetActorGroupWithBalanceByIdHandler(groupRepo, expenseRepo);
    }

    function initDependencies(): void {
        groupRepo = new GroupRepositorySpy();
        expenseRepo = new ExpenseRepositorySpy();
    }

    function createRandomCreditExpense(balance: number): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance,
            creditor: Member.fromUser(DEFAULT_USER),
        };
        return new GroupExpense(metadata, dummyGroup, payment);
    }

    function createRandomDebitExpense(balance: number): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance,
            creditor: getRandomMemberFrom(
                dummyGroup.getMembersExcluding(DEFAULT_USER.getId()),
            ),
        };
        return new GroupExpense(metadata, dummyGroup, payment);
    }

    function getRandomMemberFrom(members: Array<Member>): Member {
        const randomIndex = Math.floor(Math.random() * members.length);
        return members[randomIndex];
    }
});
