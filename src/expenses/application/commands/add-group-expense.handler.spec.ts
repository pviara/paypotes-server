import {
    AddGroupExpenseCommand,
    AddGroupExpenseHandler,
} from '@expenses/application/commands/add-group-expense.handler';
import { ContactTaskMessengerSpy } from '@test/doubles/contact-task-messenger.spy';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomBalance } from '@test/helpers/expense/utils';
import { generateRandomMembers } from '@test/helpers/group/utils';
import { Group, MemberNotInGroupError } from '@groups/domain/group';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { GroupNotFoundError } from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';
import { Member } from '@groups/domain/member';
import { Metadata } from '@expenses/domain/expense';
import { Stakeholder } from '@expenses/domain/stakeholder';

describe('AddGroupExpenseHandler', () => {
    let sut: AddGroupExpenseHandler;

    let expenseRepo: ExpenseRepositorySpy;
    let groupRepo: GroupRepositorySpy;
    let messenger: ContactTaskMessengerSpy;

    const dummyActorId = crypto.randomUUID();
    const dummyExpenseId = crypto.randomUUID();
    const dummyExpenseLabel = 'Snowboard rental';
    const dummyExpenseEmoji = '🏂';
    const dummyExpenseGroupId = crypto.randomUUID();
    const dummyExpenseMemberId = crypto.randomUUID();

    const dummyCommand = new AddGroupExpenseCommand({
        actorId: dummyActorId,
        id: dummyExpenseId,
        label: dummyExpenseLabel,
        emoji: dummyExpenseEmoji,
        balance: generateRandomBalance(),
        groupId: dummyExpenseGroupId,
        memberId: dummyExpenseMemberId,
    });

    const dummyMember = new Member({
        id: dummyExpenseMemberId,
        firstname: 'James',
        lastname: 'Potter',
    });

    const dummyGroup = new Group({
        id: dummyExpenseGroupId,
        name: 'Over the mountain',
        emoji: '🏔️',
        members: [dummyMember, ...generateRandomMembers()],
    });

    beforeEach(() => {
        initSut();
        groupRepo.stub('getActorGroupById', dummyGroup);
    });

    it('should check that expense group exists', async () => {
        await sut.execute(dummyCommand);
        expect(groupRepo.calls.getActorGroupById.count).toBe(1);
        expect(groupRepo.calls.getActorGroupById.history).toContainEqual([
            dummyActorId,
            dummyExpenseGroupId,
        ]);
    });

    describe('group does not exist', () => {
        beforeEach(() => {
            groupRepo.stub('getActorGroupById', null);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                GroupNotFoundError,
            );
        });
    });

    describe('user does not exist inside of group', () => {
        it('should throw an error', async () => {
            const NOT_EXISTING_GROUP_USER = crypto.randomUUID();
            const dummyCommand = new AddGroupExpenseCommand({
                actorId: dummyActorId,
                id: dummyExpenseId,
                label: dummyExpenseLabel,
                emoji: dummyExpenseEmoji,
                balance: generateRandomBalance(),
                groupId: dummyExpenseGroupId,
                memberId: NOT_EXISTING_GROUP_USER,
            });

            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                MemberNotInGroupError,
            );
        });
    });

    it('should save the group expense', async () => {
        await sut.execute(dummyCommand);

        const metadata: Metadata = {
            id: dummyCommand.payload.id,
            label: dummyCommand.payload.label,
            emoji: dummyCommand.payload.emoji,
        };
        const payment: GroupPayment = {
            balance: dummyCommand.payload.balance,
            creditor: Stakeholder.fromMember(dummyMember),
        };
        const expense = new GroupExpense(metadata, dummyGroup, payment);

        expect(expenseRepo.calls.save.count).toBe(1);
        expect(expenseRepo.calls.save.history).toContainEqual(expense);
    });

    it('should send a message using contact task messenger', async () => {
        await sut.execute(dummyCommand);
        expect(
            messenger.calls.sendRelationshipsMustBeCreatedBetween.count,
        ).toBe(1);
        expect(
            messenger.calls.sendRelationshipsMustBeCreatedBetween.history,
        ).toContainEqual(dummyGroup.getMembers());
    });

    function initSut(): void {
        initDependencies();
        sut = new AddGroupExpenseHandler(expenseRepo, groupRepo, messenger);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
        groupRepo = new GroupRepositorySpy();
        messenger = new ContactTaskMessengerSpy();
    }
});
