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
import {
    GroupExpense,
    GroupExpenseBuilder,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
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
            const dummyExpense = generateRandomDebitExpense();
            const { creditor } = dummyExpense.getPayment();
            const initialActorShare = dummyExpense.getShareOf(
                DEFAULT_USER.getId(),
            );
            const initialCreditorShare = dummyExpense.getShareOf(
                creditor.getId(),
            );

            it("should settle actor's share and reduce creditor's", async () => {
                expenseRepo.stub('getActorGroupExpenseById', dummyExpense);

                await sut.execute(dummyCommand);

                expect(dummyExpense.getShareOf(dummyActorId)).toBe(0);
                expectOtherCounterpartiesShareNotToHaveBeenSettled();

                const updatedCreditorShare = dummyExpense.getShareOf(
                    creditor.getId(),
                );
                expect(updatedCreditorShare).toBe(
                    initialCreditorShare - initialActorShare,
                );
            });

            function generateRandomDebitExpense(): GroupExpense {
                const metadata = generateRandomMetadata();
                const payment: GroupPayment = {
                    balance: 1000,
                    creditor: generateRandomMember(),
                };
                return new GroupExpenseBuilder()
                    .withMetadata(metadata)
                    .withGroup(dummyGroup)
                    .withPayment(payment)
                    .build();
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
            const dummyExpense = generateRandomCreditExpense();
            const allDummyDebtorIds = dummyGroup
                .getMembersExcluding(dummyActorId)
                .map((member) => member.getId());

            const initialCreditorShare = dummyExpense.getShareOf(dummyActorId);

            beforeEach(() => {
                expenseRepo.stub('getActorGroupExpenseById', dummyExpense);
            });

            describe('only some debtors have paid back', () => {
                const dummyDebtorId = allDummyDebtorIds[0];

                it("should settle only given debtor's share and reduce creditor's", async () => {
                    dummyCommand.payload.debtorIds = [dummyDebtorId];

                    const initialDebtorShare =
                        dummyExpense.getShareOf(dummyDebtorId);

                    await sut.execute(dummyCommand);

                    expectOnlyDummyDebtorToHaveTheirShareSettledIn(
                        dummyExpense,
                    );

                    const updatedCreditorShare =
                        dummyExpense.getShareOf(dummyActorId);

                    expect(updatedCreditorShare).toBe(
                        initialCreditorShare - initialDebtorShare,
                    );
                });

                function expectOnlyDummyDebtorToHaveTheirShareSettledIn(
                    expense: GroupExpense,
                ): void {
                    expect(expense.getShareOf(dummyDebtorId)).toBe(0);
                    expense
                        .getStakeholders()
                        .filter(
                            (stakeholder) =>
                                stakeholder.getId() !== dummyDebtorId,
                        )
                        .map((stakeholder) => stakeholder.getShare())
                        .forEach((share) => expect(share).not.toBe(0));
                }
            });

            describe('all debtors have paid back', () => {
                it('should settle all expense stakeholders share', async () => {
                    dummyCommand.payload.debtorIds = allDummyDebtorIds;

                    await sut.execute(dummyCommand);

                    expectAllStakeholdersToHaveTheirShareSettledIn(
                        dummyExpense,
                    );
                });

                function expectAllStakeholdersToHaveTheirShareSettledIn(
                    expense: GroupExpense,
                ): void {
                    expense
                        .getStakeholders()
                        .map((stakeholder) => stakeholder.getShare())
                        .forEach((share) => expect(share).toBe(0));
                }
            });

            function generateRandomCreditExpense(): GroupExpense {
                const metadata = generateRandomMetadata();
                const payment: GroupPayment = {
                    balance: 1000,
                    creditor: Member.fromUser(DEFAULT_USER),
                };
                return new GroupExpenseBuilder()
                    .withMetadata(metadata)
                    .withGroup(dummyGroup)
                    .withPayment(payment)
                    .build();
            }
        });

        it('should update expense', async () => {
            await sut.execute(dummyCommand);

            expect(expenseRepo.calls.updateGroupExpense.count).toBe(1);
            expect(expenseRepo.calls.updateGroupExpense.history).toContainEqual(
                dummyExpense,
            );
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
