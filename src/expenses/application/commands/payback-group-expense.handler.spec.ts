import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import {
    generateDefaultUserGroupExpense,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import {
    generateDefaultUserRandomGroup,
    generateRandomMember,
} from '@test/helpers/group/utils';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { Member } from '@groups/domain/member';
import {
    PaybackGroupExpenseCommand,
    PaybackGroupExpenseHandler,
} from '@expenses/application/commands/payback-group-expense.handler';

describe('PaybackGroupExpenseHandler', () => {
    let sut: PaybackGroupExpenseHandler;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyGroupId = crypto.randomUUID();
    const dummyExpenseId = crypto.randomUUID();

    const dummyCommand = new PaybackGroupExpenseCommand({
        actorId: dummyActorId,
        groupId: dummyGroupId,
        expenseId: dummyExpenseId,
        debtorIds: [],
    });

    const dummyGroup = generateDefaultUserRandomGroup();

    const dummyExpense = generateDefaultUserGroupExpense(dummyGroup);

    beforeEach(() => {
        initSut();
        expenseRepo.stub('getActorGroupExpenseById', dummyExpense);
    });

    it("should retrieve the actor's expense", async () => {
        await sut.execute(dummyCommand);

        expect(expenseRepo.calls.getActorGroupExpenseById.count).toBe(1);
        expect(
            expenseRepo.calls.getActorGroupExpenseById.history,
        ).toContainEqual([dummyActorId, dummyGroupId, dummyExpenseId]);
    });

    describe('expense does not exist', () => {
        beforeEach(() => {
            expenseRepo.stub('getActorGroupExpenseById', null);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                ExpenseNotFoundError,
            );
        });
    });

    describe('expense exists', () => {
        describe('actor is debtor', () => {
            it("should settle actor's share", async () => {
                const dummyExpense = generateRandomDebitExpense();
                expenseRepo.stub('getActorGroupExpenseById', dummyExpense);

                await sut.execute(dummyCommand);

                expect(dummyExpense.getShareOf(dummyActorId)).toBe(0);
                expectOtherCounterpartiesShareNotToHaveBeenSettled();
            });

            function generateRandomDebitExpense(): GroupExpense {
                const metadata = generateRandomMetadata();
                const payment: GroupPayment = {
                    balance: 1000,
                    creditor: generateRandomMember(),
                };
                return new GroupExpense(metadata, dummyGroup, payment);
            }

            function expectOtherCounterpartiesShareNotToHaveBeenSettled(): void {
                const counterparties =
                    dummyExpense.getCounterpartiesOf(dummyActorId);
                counterparties.forEach((counterparty) =>
                    expect(counterparty.getShare()).not.toBe(0),
                );
            }
        });

        describe('actor is creditor', () => {
            it('should settle given debtors share', async () => {
                const dummyExpense = generateRandomCreditExpense();
                expenseRepo.stub('getActorGroupExpenseById', dummyExpense);

                const dummyDebtorIds = dummyGroup
                    .getMembersExcluding(dummyActorId)
                    .map((member) => member.getId());

                dummyCommand.payload.debtorIds = dummyDebtorIds;

                await sut.execute(dummyCommand);

                expect(dummyExpense.getShareOf(dummyActorId)).not.toBe(0);
                expectOtherCounterpartiesToHaveTheirShareSettledIn(
                    dummyExpense,
                );
            });

            function generateRandomCreditExpense(): GroupExpense {
                const metadata = generateRandomMetadata();
                const payment: GroupPayment = {
                    balance: 1000,
                    creditor: Member.fromUser(DEFAULT_USER),
                };
                return new GroupExpense(metadata, dummyGroup, payment);
            }

            function expectOtherCounterpartiesToHaveTheirShareSettledIn(
                expense: GroupExpense,
            ): void {
                dummyCommand.payload.debtorIds.forEach((debtorId) =>
                    expect(expense.getShareOf(debtorId)).toBe(0),
                );
            }
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new PaybackGroupExpenseHandler(expenseRepo);
    }

    function initDependencies(): void {
        expenseRepo = new ExpenseRepositorySpy();
    }
});
