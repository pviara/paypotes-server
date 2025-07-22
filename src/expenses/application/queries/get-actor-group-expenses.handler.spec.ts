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
import { Member } from '@groups/domain/member';

describe('GetActorGroupExpensesHandler', () => {
    let sut: GetActorGroupExpensesHandler;
    let expenseRepo: ExpenseRepositorySpy;

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
        new GroupExpense(generateRandomMetadata(), dummyGroup, {
            balance: 1000,
            creditor: getRandomMemberFrom(otherMembers),
        }),
        new GroupExpense(generateRandomMetadata(), dummyGroup, {
            balance: 3000,
            creditor: Member.fromUser(DEFAULT_USER),
        }),
    ];

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorGroupExpensesHandler(expenseRepo);

        expenseRepo.stub('getActorGroupExpenses', dummyExpenses);
    });

    it("should retrieve the actor's group expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getActorGroupExpenses.count).toBe(1);
        expect(expenseRepo.calls.getActorGroupExpenses.history).toContainEqual([
            dummyActorId,
            dummyGroupId,
            dummyPageIndex,
            dummySearch,
        ]);
    });

    it('should return the expenses that were retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(
            dummyExpenses.map((expense) =>
                GroupExpenseSnapshot.from(expense, dummyActorId),
            ),
        );
    });

    function getRandomMemberFrom(members: Array<Member>): Member {
        const randomIndex = Math.floor(Math.random() * members.length);
        return members[randomIndex];
    }
});
