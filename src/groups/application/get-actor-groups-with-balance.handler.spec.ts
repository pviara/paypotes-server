import {
    calculateExpectedBalanceFor,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpensesByGroup } from '@expenses/persistence/expense.repository';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateDefaultUserRandomGroups } from '@test/helpers/group/utils';
import {
    GetActorGroupsWithBalanceHandler,
    GetActorGroupsWithBalanceQuery,
} from '@groups/application/get-actor-groups-with-balance.handler';
import { Group } from '@groups/domain/group';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';
import { mapIdsFrom } from '@test/helpers/utils';
import { Member } from '@groups/domain/member';

describe('GetActorGroupsWithBalanceHandler', () => {
    let sut: GetActorGroupsWithBalanceHandler;

    let groupRepo: GroupRepositorySpy;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyPageIndex = 0;
    const dummySearch = 'a group name';

    const dummyQuery = new GetActorGroupsWithBalanceQuery({
        actorId: dummyActorId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    const dummyGroups = generateDefaultUserRandomGroups({ length: 10 });

    beforeEach(() => {
        initSut();
        groupRepo.stub('getActorGroups', dummyGroups);
    });

    it("should retrieve the actor's groups", async () => {
        await sut.execute(dummyQuery);
        expect(groupRepo.calls.getActorGroups.count).toBe(1);
        expect(groupRepo.calls.getActorGroups.history).toContainEqual([
            dummyActorId,
            dummyPageIndex,
            dummySearch,
        ]);
    });

    it("should retrieve all actor's groups expenses", async () => {
        await sut.execute(dummyQuery);

        expect(expenseRepo.calls.getAllActorGroupsExpenses.count).toBe(1);

        const groupIds = mapIdsFrom(dummyGroups);
        expect(
            expenseRepo.calls.getAllActorGroupsExpenses.history,
        ).toContainEqual([dummyActorId, groupIds]);
    });

    it("should compute each of the actor's groups balance correctly", async () => {
        const expensesByGroup: ExpensesByGroup = {};
        dummyGroups.forEach((group) => {
            expensesByGroup[group.getId()] = [
                createRandomCreditExpenseFor(group, 894),
                createRandomDebitExpenseFor(group, 120),
                createRandomDebitExpenseFor(group, 312),
            ];
        });
        expenseRepo.stub('getAllActorGroupsExpenses', expensesByGroup);

        const groups = await sut.execute(dummyQuery);

        expect(groups.length).toBe(dummyGroups.length);

        groups.forEach((group) => {
            const expenses = expensesByGroup[group.getId()];
            const expectedBalance = calculateExpectedBalanceFor(expenses);
            expect(group.getBalance()).toBe(expectedBalance);
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new GetActorGroupsWithBalanceHandler(groupRepo, expenseRepo);
    }

    function initDependencies(): void {
        groupRepo = new GroupRepositorySpy();
        expenseRepo = new ExpenseRepositorySpy();
    }

    function createRandomCreditExpenseFor(
        group: Group,
        balance: number,
    ): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance,
            creditor: Member.fromUser(DEFAULT_USER),
        };
        return new GroupExpense(metadata, group, payment);
    }

    function createRandomDebitExpenseFor(
        group: Group,
        balance: number,
    ): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance,
            creditor: getRandomMemberFrom(
                group.getMembersExcluding(DEFAULT_USER.getId()),
            ),
        };
        return new GroupExpense(metadata, group, payment);
    }

    function getRandomMemberFrom(members: Array<Member>): Member {
        const randomIndex = Math.floor(Math.random() * members.length);
        return members[randomIndex];
    }
});
