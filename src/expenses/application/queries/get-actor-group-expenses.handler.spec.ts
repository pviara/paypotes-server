import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    GetActorGroupExpensesHandler,
    GetActorGroupExpensesQuery,
} from '@expenses/application/queries/get-actor-group-expenses.handler';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import { generateDefaultUserRandomGroup } from '@test/helpers/group/utils';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { GroupExpenseSnapshot } from '@expenses/domain/expense/group/group-expense-snapshot';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';
import { Member } from '@groups/domain/member';
import { GroupNotFoundError } from '@app/groups/application/get-actor-group-with-balance-by-id.handler';

describe('GetActorGroupExpensesHandler', () => {
    let sut: GetActorGroupExpensesHandler;

    let expenseRepo: ExpenseRepositorySpy;
    let groupRepo: GroupRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroup = generateDefaultUserRandomGroup();
    const dummyGroupId = dummyGroup.getId();
    const dummyPageIndex = 0;
    const dummySearch = 'an expense label';

    const dummyQuery = new GetActorGroupExpensesQuery({
        actorId: dummyActorId,
        groupId: dummyGroupId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    const otherMembers = dummyGroup.getMembersExcluding(dummyActorId);
    const dummyExpenses = [
        GroupExpense.create(generateRandomMetadata(), dummyGroup, {
            balance: 1000,
            creditor: getRandomMemberFrom(otherMembers),
        }),
        GroupExpense.create(generateRandomMetadata(), dummyGroup, {
            balance: 3000,
            creditor: Member.fromUser(DEFAULT_USER),
        }),
    ];

    beforeEach(() => {
        initSut();
        expenseRepo.stub('getActorGroupExpenses', dummyExpenses);
        groupRepo.stub('getActorGroupById', dummyGroup);
    });

    it("should retrieve the actor's group", async () => {
        await sut.execute(dummyQuery);
        expect(groupRepo.calls.getActorGroupById.count).toBe(1);
        expect(groupRepo.calls.getActorGroupById.history).toContainEqual([
            dummyActorId,
            dummyGroupId,
        ]);
    });

    describe('no group exists', () => {
        beforeEach(() => {
            groupRepo.stub('getActorGroupById', null);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                GroupNotFoundError,
            );
        });
    });

    describe('group exists', () => {
        it("should retrieve the actor's group expenses", async () => {
            await sut.execute(dummyQuery);
            expect(expenseRepo.calls.getActorGroupExpenses.count).toBe(1);
            expect(
                expenseRepo.calls.getActorGroupExpenses.history,
            ).toContainEqual([
                dummyActorId,
                dummyGroup,
                dummyPageIndex,
                dummySearch,
            ]);
        });

        it('should return the expenses that were retrieved', async () => {
            const result = await sut.execute(dummyQuery);
            expect(result).toStrictEqual(
                dummyExpenses.map((expense) =>
                    GroupExpenseSnapshot.create({
                        expense,
                        perspectiveId: dummyActorId,
                    }),
                ),
            );
        });
    });

    function getRandomMemberFrom(members: Array<Member>): Member {
        const randomIndex = Math.floor(Math.random() * members.length);
        return members[randomIndex];
    }

    function initSut(): void {
        initDependencies();
        sut = new GetActorGroupExpensesHandler(expenseRepo, groupRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
        groupRepo = new GroupRepositorySpy();
    }
});
