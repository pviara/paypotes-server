import {
    AddExpenseCommand,
    AddExpenseHandler,
} from '@expenses/application/add-expense.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';

describe('AddExpenseHandler', () => {
    let sut: AddExpenseHandler;

    let expenseRepo: ExpenseRepositorySpy;
    let groupRepo: GroupRepositorySpy;

    const dummyActorId = crypto.randomUUID();
    const dummyExpenseId = crypto.randomUUID();
    const dummyExpenseLabel = 'Meatpacking';
    const dummyExpenseEmoji = '🥩';
    const dummyExpenseStakeholderId = crypto.randomUUID();

    const dummyCommand = new AddExpenseCommand({
        actorId: dummyActorId,
        id: dummyExpenseId,
        label: dummyExpenseLabel,
        emoji: dummyExpenseEmoji,
        stakeholderId: dummyExpenseStakeholderId,
    });

    beforeEach(() => {
        initSut();
    });

    it('should check that expense group exists', async () => {
        await sut.execute(dummyCommand);
    });

    function initSut(): void {
        initDependencies();
        sut = new AddExpenseHandler();
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
        groupRepo = new GroupRepositorySpy();
    }
});
