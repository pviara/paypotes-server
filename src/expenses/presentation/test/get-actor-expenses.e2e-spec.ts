import { App } from 'supertest/types';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import * as request from 'supertest';
import { Expense } from '@app/expenses/domain/expense/expense';
import { ExpenseDTO } from '../dto/expense.dto';

describe('getActorExpenses', () => {
    const application = initApplicationWith(modules);

    let fixture: Fixture;
    let httpServer: App;

    const actorId = DEFAULT_USER.getId();

    beforeAll(async () => {
        await application.bootstrap();

        fixture = Fixture.create(application);
        httpServer = application.getHttpServer();
    });

    describe('actor has no expense', () => {
        it('should return an empty array', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body.length).toBe(0);
        });
    });

    describe('actor has expenses', () => {
        let dummyExpenses: Array<Expense>;
        let unrelatedExpenses: Array<Expense>;

        beforeEach(async () => {
            const { expenses: groupExpenses } =
                await fixture.setupDefaultUserUniqueGroupExpenses();

            const pairExpenses = await fixture.setupDefaultUserPairExpenses();

            dummyExpenses = [...groupExpenses, ...pairExpenses];
            unrelatedExpenses = await fixture.setupRandomPairExpenses({
                length: 10,
            });
        });

        it('should return the first 20 expenses by default', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(20);
            expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
            expectReturnedDtosNotToBeUnrelatedExpenses(dtos);
        });

        function expectReturnedDtosToBeTheFirstTwentyExpenses(
            dtos: Array<ExpenseDTO>,
        ): void {
            const firstTwentyExpenses = sortByDateDescending(
                dummyExpenses,
            ).slice(0, 20);
            const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
                dtoIsIn(firstTwentyExpenses),
            );

            expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
        }

        function sortByDateDescending(
            dummyExpenses: Array<Expense>,
        ): Array<Expense> {
            return dummyExpenses.sort(
                (previous, current) =>
                    new Date(current.getCreatedAt()).getTime() -
                    new Date(previous.getCreatedAt()).getTime(),
            );
        }

        function expectReturnedDtosNotToBeUnrelatedExpenses(
            dtos: Array<ExpenseDTO>,
        ): void {
            const returnedDtosAreNotUnrelatedExpenses = dtos.every(
                dtoIsNotIn(unrelatedExpenses),
            );

            expect(returnedDtosAreNotUnrelatedExpenses).toBe(true);
        }

        function dtoIsIn(
            expenses: Array<Expense>,
        ): (dto: ExpenseDTO) => boolean {
            return (dto: ExpenseDTO) =>
                expenses.some((expense) => expense.getId() === dto.id);
        }

        function dtoIsNotIn(
            expenses: Array<Expense>,
        ): (dto: ExpenseDTO) => boolean {
            return (dto: ExpenseDTO) =>
                expenses.every((expense) => expense.getId() !== dto.id);
        }
    });
});
