import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import { generateRandomUser } from '@test/helpers/user/utils';
import {
    GetActorExpensesHandler,
    GetActorExpensesQuery,
} from '@expenses/application/queries/get-actor-expenses.handler';
import { generateDefaultUserRandomGroup } from '@test/helpers/group/utils';
import { GroupExpense } from '@expenses/domain/group-expense';
import { GroupExpensePerspectiveView } from '@expenses/domain/group-expense-perspective-view';
import { Member } from '@groups/domain/member';
import { PairExpense } from '@expenses/domain/pair-expense';
import { PairExpensePerspectiveView } from '@expenses/domain/pair-expense-perspective-view';

describe('GetActorExpensesHandler', () => {
    let sut: GetActorExpensesHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroup = generateDefaultUserRandomGroup();
    const dummyPageIndex = 0;
    const dummySearch = 'a group name';

    const dummyQuery = new GetActorExpensesQuery({
        actorId: dummyActorId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    const otherMembers = dummyGroup.getMembersExcluding(dummyActorId);
    const dummyExpenses = [
        new GroupExpense(generateRandomMetadata(), dummyGroup, {
            balance: 1000,
            creditor: getRandomMemberFrom(otherMembers),
        }),
        new PairExpense(generateRandomMetadata(), {
            balance: 2000,
            creditor: generateRandomUser(),
            debtor: DEFAULT_USER,
        }),
    ];

    beforeEach(() => {
        expenseRepo = new ExpenseRepositorySpy();
        sut = new GetActorExpensesHandler(expenseRepo);

        expenseRepo.stub('getActorExpenses', dummyExpenses);
    });

    it("should retrieve the actor's expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getActorExpenses.count).toBe(1);
        expect(expenseRepo.calls.getActorExpenses.history).toContainEqual([
            dummyActorId,
            dummyPageIndex,
            dummySearch,
        ]);
    });

    it('should return the expenses that were retrieved', async () => {
        const result = await sut.execute(dummyQuery);

        expect(result).toStrictEqual(
            dummyExpenses.map((expense) => {
                if (expense instanceof PairExpense)
                    return PairExpensePerspectiveView.from(
                        expense,
                        dummyActorId,
                    );
                if (expense instanceof GroupExpense)
                    return GroupExpensePerspectiveView.from(
                        expense,
                        dummyActorId,
                    );
            }),
        );
    });

    function getRandomMemberFrom(members: Array<Member>): Member {
        const randomIndex = Math.floor(Math.random() * members.length);
        return members[randomIndex];
    }
});
