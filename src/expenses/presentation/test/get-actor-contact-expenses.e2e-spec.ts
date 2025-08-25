import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { empty, shutdown } from '@test/helpers/utils';
import { Expense } from '@expenses/domain/expense/expense';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import * as request from 'supertest';

describe('getActorContactExpenses', () => {
    const application = initApplicationWith(modules);

    let fixture: Fixture;
    let httpServer: App;

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
            'should return 400 BAD_REQUEST when given contactId "%s" is not a valid uuid',
            async (contactId: unknown) => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${contactId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe('actor has no expense with contact', () => {
        it('should return an empty array', async () => {
            const dummyContact = await fixture.setupDefaultUserContact();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body.length).toBe(0);
        });
    });

    describe('actor has expenses with contact', () => {
        let dummyContact: Contact;
        let dummyExpenses: Array<PairExpense>;
        let unrelatedExpenses: Array<PairExpense>;

        beforeEach(async () => {
            const { contact, expenses } =
                await fixture.setupDefaultUserUniqueContactPairExpenses();

            dummyContact = contact;
            dummyExpenses = expenses;
            unrelatedExpenses = await fixture.setupDefaultUserPairExpenses();
        });

        it('should return the first 20 expenses by default', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(20);
            expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
            expectReturnedDtosNotToBeUnrelatedExpenses(dtos);
        });

        describe('page index has been given', () => {
            it('should return the second 20 expenses when given index is 1', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}?pageIndex=1`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheSecondTwentyExpenses(dtos);
            });

            function expectReturnedDtosToBeTheSecondTwentyExpenses(
                dtos: Array<PairExpenseDTO>,
            ): void {
                const secondTwentyExpenses = sortByDateDescending(
                    dummyExpenses,
                ).slice(20, 40);
                const returnedDtosAreTheSecondTwentyExpenses = dtos.every(
                    dtoIsIn(secondTwentyExpenses),
                );

                expect(returnedDtosAreTheSecondTwentyExpenses).toBe(true);
            }
        });

        describe('search has been given', () => {
            it('should return the expenses that match the search', async () => {
                const targetExpense = dummyExpenses[0];
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}?search=${targetExpense.getLabel()}`,
                );

                expect(response.body.length).toBe(1);
                expect(response.body[0].id).toBe(targetExpense.getId());
            });
        });

        function expectReturnedDtosToBeTheFirstTwentyExpenses(
            dtos: Array<PairExpenseDTO>,
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
            dummyExpenses: Array<PairExpense>,
        ): Array<PairExpense> {
            return dummyExpenses.sort(
                (previous, current) =>
                    new Date(current.getCreatedAt()).getTime() -
                    new Date(previous.getCreatedAt()).getTime(),
            );
        }

        function expectReturnedDtosNotToBeUnrelatedExpenses(
            dtos: Array<PairExpenseDTO>,
        ): void {
            const returnedDtosAreNotUnrelatedExpenses = dtos.every(
                dtoIsNotIn(unrelatedExpenses),
            );

            expect(returnedDtosAreNotUnrelatedExpenses).toBe(true);
        }

        function dtoIsIn(
            expenses: Array<Expense>,
        ): (dto: PairExpenseDTO) => boolean {
            return (dto: PairExpenseDTO) =>
                expenses.some((expense) => expense.getId() === dto.id);
        }

        function dtoIsNotIn(
            expenses: Array<Expense>,
        ): (dto: PairExpenseDTO) => boolean {
            return (dto: PairExpenseDTO) =>
                expenses.every((expense) => expense.getId() !== dto.id);
        }
    });
});
