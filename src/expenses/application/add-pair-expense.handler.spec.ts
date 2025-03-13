import {
    AddPairExpenseCommand,
    AddPairExpenseHandler,
    UserExpenseNotFound,
} from '@app/expenses/application/add-pair-expense.handler';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';
import { User } from '@users/domain/user';
import { PairExpense, PairPayment } from '../domain/pair-expense';
import { Metadata } from '../domain/expense';
import {
    generateRandomBalance,
    generateRandomBoolean,
} from '@test/helpers/expense/utils';
import { Stakeholder } from '../domain/stakeholder';

describe('AddExpenseHandler', () => {
    let sut: AddPairExpenseHandler;

    let expenseRepo: ExpenseRepositorySpy;
    let userRepo: UserRepositorySpy;

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
                UserExpenseNotFound,
            );
        });
    });

    describe('user exists', () => {
        it('should save the expense metadata', async () => {
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

        function getCommandCreditor(): Stakeholder {
            return dummyCommand.payload.isCurrentPayer
                ? Stakeholder.fromUser(dummyActor)
                : Stakeholder.fromUser(dummyUser);
        }

        function getCommandDebtor(): Stakeholder {
            return dummyCommand.payload.isCurrentPayer
                ? Stakeholder.fromUser(dummyUser)
                : Stakeholder.fromUser(dummyActor);
        }
    });

    function initSut(): void {
        initDependencies();
        sut = new AddPairExpenseHandler(expenseRepo, userRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
        userRepo = new UserRepositorySpy();
    }
});
