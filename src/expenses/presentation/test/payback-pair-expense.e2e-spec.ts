import { App } from 'supertest/types';
import { empty, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import * as request from 'supertest';

describe('computeActorBalance', () => {
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
            'should return 400 BAD_REQUEST when given contactId "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).put(
                    `/${EXPENSES_API_ROUTE}/pair/${id}/${validId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).put(
                    `/${EXPENSES_API_ROUTE}/pair/${validId}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe("actor's contact does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyExpense = await fixture.setupDefaultUserPairExpense();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).put(
                `/${EXPENSES_API_ROUTE}/pair/${NOT_EXISTING_ID}/${dummyExpense.getId()}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's contact expense does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyContact = await fixture.setupDefaultUserContact();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).put(
                `/${EXPENSES_API_ROUTE}/pair/${dummyContact.getId()}/${NOT_EXISTING_ID}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's contact and expense exist", () => {
        it('should have settled the right expense', async () => {
            const dummyExpense = await fixture.setupDefaultUserPairExpense();
            const dummyContact = dummyExpense.getCounterpartyOf(actorId);

            await request(httpServer).put(
                `/${EXPENSES_API_ROUTE}/pair/${dummyContact.getId()}/${dummyExpense.getId()}`,
            );

            const updatedExpense = await expenseRepo.get(dummyExpense.getId());
            expect(updatedExpense?.getShareOf(actorId)).toBe(0);
            expect(updatedExpense?.getShareOf(dummyContact.getId())).toBe(0);
        });
    });
});
