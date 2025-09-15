import { App } from 'supertest/types';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { empty, shutdown } from '@test/helpers/utils';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import * as request from 'supertest';

describe('getActorGroupExpenseById', () => {
    const application = initApplicationWith(modules);

    let fixture: Fixture;
    let httpServer: App;

    const actorId = DEFAULT_USER.getId();

    beforeAll(async () => {
        await application.bootstrap();

        fixture = Fixture.create(application);
        httpServer = application.getHttpServer();
    });

    afterAll(shutdown(application));

    beforeEach(empty(application));

    afterEach(empty(application));

    describe('given ids are invalid', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
            async (id: unknown) => {
                const dummyExpense =
                    await fixture.setupDefaultUserGroupExpense();

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${id}/expense/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
            async (id: unknown) => {
                const dummyGroup = await fixture.setupDefaultUserGroup();

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe("actor's expense does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyGroup = await fixture.setupDefaultUserGroup();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${NOT_EXISTING_ID}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's expense exists", () => {
        it('should return the right expense for given groupId and expenseId', async () => {
            const dummyExpense = await fixture.setupDefaultUserGroupExpense();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/group/${dummyExpense.getGroup().getId()}/expense/${dummyExpense.getId()}`,
            );

            expect(response.body.id).toBe(dummyExpense.getId());
            expect(response.body.label).toBe(dummyExpense.getLabel());
            expect(response.body.emoji).toBe(dummyExpense.getEmoji());
            expect(response.body.createdAt).toBeDefined();
            expect(response.body.payment.balance).toBe(
                BalanceDTO.from(dummyExpense.getPayment().balance).getValue(),
            );
        });

        describe('actor is creditor', () => {
            let dummyExpense: GroupExpense;

            beforeEach(async () => {
                dummyExpense =
                    await fixture.setupDefaultUserCreditGroupExpense();
            });

            describe("actor's expense has been settled entirely", () => {
                it('should return 404 NOT_FOUND', async () => {
                    await paybackGroupExpenseEntirely(dummyExpense);

                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/group/${dummyExpense.getGroup().getId()}/expense/${dummyExpense.getId()}`,
                    );

                    expect(response.status).toBe(HttpStatus.NOT_FOUND);
                });

                async function paybackGroupExpenseEntirely(
                    expense: GroupExpense,
                ): Promise<void> {
                    const debtorIds = expense
                        .getCounterpartiesOf(actorId)
                        .map((counterparty) => counterparty.getId());

                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${expense.getGroup().getId()}/${expense.getId()}`,
                        )
                        .send({ debtorIds });
                }
            });

            describe("actor's expense has been settled partially", () => {
                let dummyDebtorId: string;

                beforeEach(() => {
                    dummyDebtorId = dummyExpense
                        .getCounterpartiesOf(actorId)
                        .map((counterparty) => counterparty.getId())[0];
                });

                it('should still return the expense for given groupId and expenseId', async () => {
                    await paybackGroupExpensePartially(dummyExpense);

                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/group/${dummyExpense.getGroup().getId()}/expense/${dummyExpense.getId()}`,
                    );

                    expect(response.status).not.toBe(HttpStatus.NOT_FOUND);
                });

                async function paybackGroupExpensePartially(
                    expense: GroupExpense,
                ): Promise<void> {
                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${expense.getGroup().getId()}/${expense.getId()}`,
                        )
                        .send({ debtorIds: [dummyDebtorId] });
                }
            });
        });

        describe('actor is debtor', () => {
            let dummyExpense: GroupExpense;

            beforeEach(async () => {
                dummyExpense =
                    await fixture.setupDefaultUserDebitGroupExpense();
            });

            describe("actor's share has already been settled", () => {
                it('should return 404 NOT_FOUND', async () => {
                    await paybackGroupExpenseForActor();

                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/group/${dummyExpense.getGroup().getId()}/expense/${dummyExpense.getId()}`,
                    );

                    expect(response.status).toBe(HttpStatus.NOT_FOUND);
                });

                async function paybackGroupExpenseForActor(): Promise<void> {
                    await request(httpServer)
                        .put(
                            `/${EXPENSES_API_ROUTE}/group/${dummyExpense.getGroup().getId()}/${dummyExpense.getId()}`,
                        )
                        .send({ debtorIds: [actorId] });
                }
            });
        });
    });
});
