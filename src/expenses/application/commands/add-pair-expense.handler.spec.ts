import {
    AddPairExpenseCommand,
    AddPairExpenseHandler,
    ExpenseUserNotFoundError,
} from '@expenses/application/commands/add-pair-expense.handler';
import { ContactTaskMessengerSpy } from '@test/doubles/contact-task-messenger.spy';
import { DateServiceSpy } from '@test/doubles/date-service.spy';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateRandomBalance,
    generateRandomBoolean,
} from '@test/helpers/expense/utils';
import { Metadata } from '@expenses/domain/expense';
import {
    PairExpense,
    PairPayment,
} from '@app/expenses/domain/pair-expense/pair-expense';
import { User } from '@users/domain/user';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('AddPairExpenseHandler', () => {
    let sut: AddPairExpenseHandler;

    let expenseRepo: ExpenseRepositorySpy;
    let userRepo: UserRepositorySpy;
    let dateService: DateServiceSpy;
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
        avatarUrl: 'http://localhost:300',
    });

    const dummyDate = new Date('1999-01-12');

    beforeEach(() => {
        initSut();
        userRepo.stub('get', [dummyUser]);
        dateService.stub('getCurrentDate', dummyDate);
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
                createdAt: dummyDate,
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

        function getCommandCreditor(): User {
            return dummyCommand.payload.isCurrentPayer ? dummyActor : dummyUser;
        }

        function getCommandDebtor(): User {
            return dummyCommand.payload.isCurrentPayer ? dummyUser : dummyActor;
        }
    });

    function initSut(): void {
        initDependencies();
        sut = new AddPairExpenseHandler(
            expenseRepo,
            userRepo,
            dateService,
            messenger,
        );
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
        userRepo = new UserRepositorySpy();
        dateService = new DateServiceSpy();
        messenger = new ContactTaskMessengerSpy();
    }
});
