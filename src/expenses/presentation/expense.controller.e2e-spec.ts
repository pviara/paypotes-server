import { App } from 'supertest/types';
import { shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    expenseSpecModules as modules,
    generateDefaultUserPairExpense,
    generateRandomMetadata,
    generateRandomBalance,
} from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import {
    generateDefaultUserRandomGroup,
    generateRandomMember,
} from '@test/helpers/group/utils';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { Member } from '@groups/domain/member';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import * as request from 'supertest';

describe.skip('ExpenseController', () => {
    const application = initApplicationWith(modules);

    let expenseRepo: ExpensePostgresTestingRepository;
    let groupRepo: GroupPostgresTestingRepository;
    let userRepo: UserPostgresTestingRepository;
    let httpServer: App;

    const actorId = DEFAULT_USER.getId();

    beforeAll(async () => {
        await application.bootstrap();

        ({ expenseRepo, groupRepo, userRepo } = application.getRepositories());
        httpServer = application.getHttpServer();
    });

    afterAll(shutdown(application));

    beforeEach(async () => {
        await expenseRepo.empty();
        await groupRepo.empty();
        await userRepo.empty();
    });

    afterEach(async () => {
        await expenseRepo.empty();
        await groupRepo.empty();
        await userRepo.empty();
    });

    describe('PUT /expenses/group/:groupId/:expenseId', () => {
        const invalidIds = ['id', 59391, NaN, ['id']];

        const invalidDebtorIds = ['id', null, 59391, NaN, undefined, ['id']];
        const dummyDebtorIds = [crypto.randomUUID(), crypto.randomUUID()];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer)
                    .put(`/${EXPENSES_API_ROUTE}/group/${id}/${id}`)
                    .send({ debtorIds: dummyDebtorIds });

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidDebtorIds)(
            'should return 400 BAD_REQUEST when given debtor ids "%s" are not valid uuids',
            async (debtorIds: unknown) => {
                const dummyGroupId = crypto.randomUUID();
                const dummyExpenseId = crypto.randomUUID();

                const response = await request(httpServer)
                    .put(
                        `/${EXPENSES_API_ROUTE}/group/${dummyGroupId}/${dummyExpenseId}`,
                    )
                    .send({ debtorIds });

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('actor expense does not exist', () => {
            beforeEach(async () => {
                await expenseRepo.empty();
            });

            it('should return 404 NOT_FOUND', async () => {
                const [NOT_EXISTING_ID_1, NOT_EXISTING_ID_2] = [
                    crypto.randomUUID(),
                    crypto.randomUUID(),
                ];

                const response = await request(httpServer)
                    .put(
                        `/${EXPENSES_API_ROUTE}/group/${NOT_EXISTING_ID_1}/${NOT_EXISTING_ID_2}`,
                    )
                    .send({ debtorIds: dummyDebtorIds });

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        describe('actor expense exists', () => {
            const dummyGroup = generateDefaultUserRandomGroup();

            describe('actor is creditor', () => {
                describe('actor settles all debtors share', () => {
                    const dummyExpense =
                        createRandomCreditExpenseFor(dummyGroup);
                    const groupId = dummyGroup.getId();
                    const expenseId = dummyExpense.getId();

                    beforeEach(async () => {
                        await expenseRepo.empty();
                        await expenseRepo.insert(dummyExpense);
                    });

                    const debtorIds = dummyExpense
                        .getCounterpartiesOf(actorId)
                        .map((counterparty) => counterparty.getId());

                    it('should have settled all expense counterparties', async () => {
                        await request(httpServer)
                            .put(
                                `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
                            )
                            .send({ debtorIds });

                        const updatedExpense = await expenseRepo.get(expenseId);
                        expectDebtorsShareToHaveBeenSettledIn(
                            updatedExpense,
                            debtorIds,
                        );
                    });

                    it('should not retrieve fully settled expense', async () => {
                        await request(httpServer)
                            .put(
                                `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
                            )
                            .send({ debtorIds });

                        const response = await request(httpServer).get(
                            `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
                        );

                        expect(response.status).toBe(HttpStatus.NOT_FOUND);
                    });
                });

                describe('actor settles not all debtors share', () => {
                    const dummyExpense =
                        createRandomCreditExpenseFor(dummyGroup);
                    const groupId = dummyGroup.getId();
                    const expenseId = dummyExpense.getId();

                    beforeEach(async () => {
                        await expenseRepo.empty();
                        await expenseRepo.insert(dummyExpense);
                    });

                    const debtorIds = [
                        dummyExpense
                            .getCounterpartiesOf(actorId)
                            .map((counterparty) => counterparty.getId())[0],
                    ];

                    it('should have settled all expense counterparties', async () => {
                        await request(httpServer)
                            .put(
                                `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
                            )
                            .send({ debtorIds });

                        const updatedExpense = await expenseRepo.get(expenseId);
                        expectDebtorsShareToHaveBeenSettledIn(
                            updatedExpense,
                            debtorIds,
                        );
                    });

                    it('should return not fully settled expense', async () => {
                        await request(httpServer)
                            .put(
                                `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
                            )
                            .send({ debtorIds });

                        const response = await request(httpServer).get(
                            `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
                        );

                        expect(response.status).not.toBe(HttpStatus.NOT_FOUND);
                    });
                });

                function expectDebtorsShareToHaveBeenSettledIn(
                    expense: Expense,
                    debtorIds: Array<string>,
                ): void {
                    debtorIds.forEach((debtorId) =>
                        expect(expense.getShareOf(debtorId)).toBe(0),
                    );
                }
            });

            describe('actor is debtor and settles their own share', () => {
                const dummyExpense = createRandomDebitExpenseFor(dummyGroup);

                it("should have settled expense actor's share", async () => {
                    await expenseRepo.empty();
                    await expenseRepo.insert(dummyExpense);

                    const groupId = dummyGroup.getId();
                    const expenseId = dummyExpense.getId();

                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
                        )
                        .send({ debtorIds: [] });

                    const updatedExpense = await expenseRepo.get(expenseId);
                    expect(updatedExpense.getShareOf(actorId)).toBe(0);
                });
            });
        });
    });

    describe('PUT /expenses/pair/:contactId/:expenseId', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).put(
                    `/${EXPENSES_API_ROUTE}/pair/${id}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('actor expense does not exist', () => {
            beforeEach(async () => {
                await expenseRepo.empty();
            });

            it('should return 404 NOT_FOUND', async () => {
                const [NOT_EXISTING_ID_1, NOT_EXISTING_ID_2] = [
                    crypto.randomUUID(),
                    crypto.randomUUID(),
                ];

                const response = await request(httpServer).put(
                    `/${EXPENSES_API_ROUTE}/${NOT_EXISTING_ID_1}/${NOT_EXISTING_ID_2}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        describe('actor expense exists', () => {
            const dummyExpense = generateDefaultUserPairExpense();

            beforeEach(async () => {
                await expenseRepo.empty();
                await expenseRepo.insert(dummyExpense);
            });

            it('should have settled the right expense', async () => {
                const expenseId = dummyExpense.getId();

                const [counterparty] =
                    dummyExpense.getCounterpartiesOf(actorId);
                const contactId = counterparty.getId();

                await request(httpServer).put(
                    `/${EXPENSES_API_ROUTE}/pair/${contactId}/${expenseId}`,
                );

                const updatedExpense = await expenseRepo.get(expenseId);
                const debtorId = getDummyExpenseDebtorId();

                expect(updatedExpense.getShareOf(debtorId)).toBe(0);
            });

            function getDummyExpenseDebtorId(): string {
                if (dummyExpense.hasCreditor(actorId)) {
                    const [counterparty] =
                        dummyExpense.getCounterpartiesOf(actorId);

                    return counterparty.getId();
                }
                return actorId;
            }
        });
    });

    function createRandomDebitExpenseFor(group: Group): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance: generateRandomBalance(),
            creditor: generateRandomMember(),
        };
        return GroupExpense.create(metadata, group, payment);
    }

    function createRandomCreditExpenseFor(group: Group): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance: generateRandomBalance(),
            creditor: Member.fromUser(DEFAULT_USER),
        };
        return GroupExpense.create(metadata, group, payment);
    }
});
