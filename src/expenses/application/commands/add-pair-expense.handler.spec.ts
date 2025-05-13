import {
    AddPairExpenseCommand,
    AddPairExpenseHandler,
    ExpenseUserNotFoundError,
} from '@expenses/application/commands/add-pair-expense.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateRandomBalance,
    generateRandomBoolean,
} from '@test/helpers/expense/utils';
import { Metadata } from '@expenses/domain/expense';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { User } from '@users/domain/user';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';
import { ContactTaskMessengerSpy } from '@test/doubles/contact-task-messenger.spy';

describe('AddPairExpenseHandler', () => {
    let sut: AddPairExpenseHandler;

    let expenseRepo: ExpenseRepositorySpy;
    let userRepo: UserRepositorySpy;
    let messenger: ContactTaskMessengerSpy;

    const dummyActor = DEFAULT_USER;
    const dummyExpenseId = crypto.randomUUID();
    const dummyExpenseLabel = 'Meatpacking';
    const dummyExpenseEmoji = '🥩';
    const dummyExpenseUserId = crypto.randomUUID();

    const dummyCommand = new AddPairExpenseCommand({
        actor: dummyActor,
        id: dummyExpenseId,
        label: dummyExpenseLabel,
        emoji: dummyExpenseEmoji,
        balance: generateRandomBalance(),
        isCurrentPayer: generateRandomBoolean(),
        userId: dummyExpenseUserId,
    });

    const dummyUser = new User({
        id: dummyExpenseUserId,
        firstname: 'Peter',
        lastname: 'Parker',
        email: 'email@test.com',
        phone: '06457246852',
    });

    beforeEach(() => {
        initSut();
        userRepo.stub('get', [dummyUser]);
    });

    it('should check that expense user exists', async () => {
        await sut.execute(dummyCommand);
        expect(userRepo.calls.get.count).toBe(1);
        expect(userRepo.calls.get.history).toContainEqual([dummyExpenseUserId]);
    });

    describe('user does not exist', () => {
        beforeEach(() => {
            userRepo.stub('get', []);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                ExpenseUserNotFoundError,
            );
        });
    });

    describe('user exists', () => {
        it('should save the expense', async () => {
            await sut.execute(dummyCommand);

            const metadata: Metadata = {
                id: dummyCommand.payload.id,
                label: dummyCommand.payload.label,
                emoji: dummyCommand.payload.emoji,
            };
            const dummyPayment: PairPayment = {
                balance: dummyCommand.payload.balance,
                creditor: getCommandCreditor(),
                debtor: getCommandDebtor(),
            };
            const expense = new PairExpense(metadata, dummyPayment);

            expect(expenseRepo.calls.save.count).toBe(1);
            expect(expenseRepo.calls.save.history).toContainEqual(expense);
        });

        it('should send a message using contact task messenger', async () => {
            await sut.execute(dummyCommand);
            expect(
                messenger.calls.sendRelationshipMustBeCreatedBetween.count,
            ).toBe(1);
            expect(
                messenger.calls.sendRelationshipMustBeCreatedBetween.history,
            ).toContainEqual([dummyActor.getId(), dummyUser.getId()]);
        });

        function getCommandCreditor(): Stakeholder {
            return dummyCommand.payload.isCurrentPayer
                ? Stakeholder.from(dummyActor)
                : Stakeholder.from(dummyUser);
        }

        function getCommandDebtor(): Stakeholder {
            return dummyCommand.payload.isCurrentPayer
                ? Stakeholder.from(dummyUser)
                : Stakeholder.from(dummyActor);
        }
    });

    function initSut(): void {
        initDependencies();
        sut = new AddPairExpenseHandler(expenseRepo, userRepo, messenger);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
        userRepo = new UserRepositorySpy();
        messenger = new ContactTaskMessengerSpy();
    }
});
