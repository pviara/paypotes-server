import { App } from 'supertest/types';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { empty, raw, shutdown } from '@test/helpers/utils';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';
import * as request from 'supertest';

describe('getActorContactExpenseById', () => {
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
            'should return 400 BAD_REQUEST when given contactId "%s" is not a valid uuid',
            async (contactId: unknown) => {
                const validId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${contactId}/expense/${validId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
            async (expenseId: unknown) => {
                const validId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${validId}/expense/${expenseId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe("actor's contact does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyExpense = await fixture.setupDefaultUserPairExpense();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${NOT_EXISTING_ID}/expense/${dummyExpense.getId()}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's expense does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyContact = await fixture.setupDefaultUserContact();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}/expense/${NOT_EXISTING_ID}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's contact and expense both exist", () => {
        it('should return the right expense for given contactId and expenseId', async () => {
            const dummyExpense = await fixture.setupDefaultUserPairExpense();
            const dummyContact = dummyExpense.getCounterpartyOf(
                DEFAULT_USER.getId(),
            );

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}/expense/${dummyExpense.getId()}`,
            );

            const expenseView = PairExpenseSnapshot.create({
                expense: dummyExpense,
                perspectiveId: DEFAULT_USER.getId(),
            });

            expect(response.body).toStrictEqual(
                raw(PairExpenseDTO.from(expenseView)),
            );
        });

        describe('expense is settled', () => {
            it('should return 404 NOT_FOUND', async () => {
                const dummyExpense =
                    await fixture.setupDefaultUserPairExpense();

                const dummyContact = dummyExpense.getCounterpartyOf(
                    DEFAULT_USER.getId(),
                );

                await paybackPairExpense(dummyExpense);

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}/expense/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });

            async function paybackPairExpense(
                expense: PairExpense,
            ): Promise<void> {
                const [counterparty] = expense.getCounterpartiesOf(actorId);
                const contactId = counterparty.getId();

                await request(httpServer).put(
                    `/${EXPENSES_API_ROUTE}/pair/${contactId}/${expense.getId()}`,
                );
            }
        });
    });
});
