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

describe('getActorExpenseById', () => {
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

    describe('given id is invalid', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe("actor's expense does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/${NOT_EXISTING_ID}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's expense exists", () => {
        it('should return the right expense for given id', async () => {
            const dummyExpense = await fixture.setupDefaultUserPairExpense();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/${dummyExpense.getId()}`,
            );

            const expenseView = PairExpenseSnapshot.create({
                expense: dummyExpense,
                perspectiveId: DEFAULT_USER.getId(),
            });
            expect(response.body).toStrictEqual(
                raw(PairExpenseDTO.from(expenseView)),
            );
        });

        describe("actor's expense has been settled", () => {
            it('should return 404 NOT_FOUND', async () => {
                const dummyExpense =
                    await fixture.setupDefaultUserPairExpense();

                await paybackPairExpense(dummyExpense);

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });
    });

    async function paybackPairExpense(expense: PairExpense): Promise<void> {
        const [counterparty] = expense.getCounterpartiesOf(actorId);
        const contactId = counterparty.getId();

        await request(httpServer).put(
            `/${EXPENSES_API_ROUTE}/pair/${contactId}/${expense.getId()}`,
        );
    }
});
