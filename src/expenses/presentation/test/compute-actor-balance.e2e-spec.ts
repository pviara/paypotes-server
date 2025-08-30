import { App } from 'supertest/types';
import { Balance } from '@expenses/domain/balance/balance';
import { convertCents, empty, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense/expense';
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

    const actorId = DEFAULT_USER.getId();

    beforeAll(async () => {
        await application.bootstrap();

        fixture = Fixture.create(application);
        httpServer = application.getHttpServer();
    });

    afterAll(shutdown(application));

    beforeEach(empty(application));

    afterEach(empty(application));

    describe('actor has no expense', () => {
        it('should return 0,00', async () => {
            await fixture.setupDefaultUser();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/balance`,
            );

            expect(response.text).toBe('0,00');
        });
    });

    describe('actor has expenses', () => {
        let dummyExpenses: Array<Expense>;
        let balance: number;

        beforeEach(async () => {
            dummyExpenses = await setupDefaultUserExpenses();
            await setupUnrelatedExpenses();

            balance = Balance.calculate({
                expenses: dummyExpenses,
                stakeholderId: actorId,
            });
        });

        it('should return the total balance of all expenses', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/balance`,
            );

            expect(response.status).toBe(HttpStatus.OK);

            const expected = `${convertCents(balance)}`.replace('.', ',');
            expect(response.text).toBe(expected);
        });

        async function setupDefaultUserExpenses(options?: {
            length: number;
        }): Promise<Expense[]> {
            const { expenses: groupExpenses } =
                await fixture.setupDefaultUserUniqueGroupExpenses({
                    length: options?.length ?? 30,
                });

            const pairExpenses = await fixture.setupDefaultUserPairExpenses();

            return [...groupExpenses, ...pairExpenses];
        }

        async function setupUnrelatedExpenses(): Promise<Expense[]> {
            const unrelatedGroupExpenses =
                await fixture.setupRandomGroupExpenses();
            const unrelatedPairExpenses =
                await fixture.setupRandomPairExpenses();

            return [...unrelatedGroupExpenses, ...unrelatedPairExpenses];
        }
    });
});
