import { App } from 'supertest/types';
import { empty, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { Nullable } from '@app/shared/nullable';
import * as request from 'supertest';

describe('paybackGroupExpense', () => {
    const application = initApplicationWith(modules);

    let fixture: Fixture;
    let httpServer: App;
    let expenseRepo: ExpensePostgresTestingRepository;

    const actorId = DEFAULT_USER.getId();

    beforeAll(async () => {
        await application.bootstrap();

        fixture = Fixture.create(application);
        httpServer = application.getHttpServer();
        ({ expenseRepo } = application.getRepositories());
    });

    afterAll(shutdown(application));

    beforeEach(empty(application));

    afterEach(empty(application));

    describe('given ids are invalid', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];
        const validId = crypto.randomUUID();

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer)
                    .put(`/${EXPENSES_API_ROUTE}/group/${id}/${validId}`)
                    .send({ debtorIds: [] });

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer)
                    .put(`/${EXPENSES_API_ROUTE}/group/${validId}/${id}`)
                    .send({ debtorIds: [] });

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given debtorIds "%s" are not valid uuids',
            async (id: unknown) => {
                const response = await request(httpServer)
                    .put(`/${EXPENSES_API_ROUTE}/group/${validId}/${validId}`)
                    .send({ debtorIds: [id] });

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe("actor's group does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyExpense = await fixture.setupDefaultUserGroupExpense();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer)
                .put(
                    `/${EXPENSES_API_ROUTE}/group/${NOT_EXISTING_ID}/${dummyExpense.getId()}`,
                )
                .send({ debtorIds: [] });

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's expense does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyGroup = await fixture.setupDefaultUserGroup();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer)
                .put(
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/${NOT_EXISTING_ID}`,
                )
                .send({ debtorIds: [] });

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's expense exists", () => {
        describe('actor is creditor', () => {
            describe('actor settles all debtors share', () => {
                let dummyExpense: GroupExpense;
                let dummyGroup: Group;
                let debtorIds: Array<string>;

                beforeEach(async () => {
                    dummyExpense =
                        await fixture.setupDefaultUserCreditGroupExpense();
                    dummyGroup = dummyExpense.getGroup();
                    debtorIds = dummyExpense
                        .getCounterpartiesOf(actorId)
                        .map((counterparty) => counterparty.getId());
                });

                it('should have settled all expense counterparties', async () => {
                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/${dummyExpense.getId()}`,
                        )
                        .send({ debtorIds });

                    const updatedExpense = await expenseRepo.get(
                        dummyExpense.getId(),
                        actorId,
                    );
                    expectDebtorsShareToHaveBeenSettledIn(updatedExpense);
                });

                it('should not retrieve fully settled expense', async () => {
                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/${dummyExpense.getId()}`,
                        )
                        .send({ debtorIds });

                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
                    );

                    expect(response.status).toBe(HttpStatus.NOT_FOUND);
                });

                function expectDebtorsShareToHaveBeenSettledIn(
                    expense: Nullable<Expense>,
                ): void {
                    debtorIds.forEach((debtorId) =>
                        expect(expense?.getShareOf(debtorId)).toBe(0),
                    );
                }
            });

            describe('actor settles not all debtors share', () => {
                let dummyExpense: GroupExpense;
                let dummyGroup: Group;
                let debtorIds: Array<string>;

                beforeEach(async () => {
                    dummyExpense =
                        await fixture.setupDefaultUserCreditGroupExpense();
                    dummyGroup = dummyExpense.getGroup();
                    debtorIds = [
                        dummyExpense
                            .getCounterpartiesOf(actorId)
                            .map((counterparty) => counterparty.getId())[0],
                    ];
                });

                it('should have settled all expense counterparties', async () => {
                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/${dummyExpense.getId()}`,
                        )
                        .send({ debtorIds });

                    const updatedExpense = await expenseRepo.get(
                        dummyExpense.getId(),
                        actorId,
                    );
                    expectDebtorsShareToHaveBeenSettledIn(updatedExpense);
                });

                it('should return not fully settled expense', async () => {
                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/${dummyExpense.getId()}`,
                        )
                        .send({ debtorIds });

                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
                    );

                    expect(response.status).not.toBe(HttpStatus.NOT_FOUND);
                });

                function expectDebtorsShareToHaveBeenSettledIn(
                    expense: Nullable<Expense>,
                ): void {
                    debtorIds.forEach((debtorId) =>
                        expect(expense?.getShareOf(debtorId)).toBe(0),
                    );
                }
            });
        });

        describe('actor is debtor and settles their own share', () => {
            it("should have settled expense actor's share", async () => {
                const dummyExpense =
                    await fixture.setupDefaultUserDebitGroupExpense();
                const dummyGroup = dummyExpense.getGroup();

                await request(httpServer)
                    .put(
                        `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/${dummyExpense.getId()}`,
                    )
                    .send({ debtorIds: [] });

                const updatedExpense = await expenseRepo.get(
                    dummyExpense.getId(),
                    actorId,
                );
                expect(updatedExpense?.getShareOf(actorId)).toBe(0);
            });
        });
    });
});
