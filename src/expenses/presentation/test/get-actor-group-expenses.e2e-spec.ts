import { App } from 'supertest/types';
import { empty, shutdown } from '@test/helpers/utils';
import { Expense } from '@expenses/domain/expense/expense';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '../expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { GroupExpenseDTO } from '@expenses/presentation/dto/group-expense.dto';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import * as request from 'supertest';

describe('getActorGroupExpenses', () => {
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
            'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe('actor has no expense in group', () => {
        it('should return an empty array', async () => {
            const dummyGroup = await fixture.setupDefaultUserGroup();

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body.length).toBe(0);
        });
    });

    describe('actor has expenses in group', () => {
        let dummyGroup: Group;
        let dummyExpenses: Array<GroupExpense>;
        let unrelatedExpenses: Array<GroupExpense>;

        beforeEach(async () => {
            const { group, expenses } =
                await fixture.setupDefaultUserUniqueGroupExpenses();

            dummyGroup = group;
            dummyExpenses = expenses;

            ({ expenses: unrelatedExpenses } =
                await fixture.setupDefaultUserUniqueGroupExpenses());
        });

        it('should return the first 20 expenses by default', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(20);
            expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
            expectReturnedDtosNotToBeUnrelatedExpenses(dtos);
        });

        describe('page index has been given', () => {
            it('should return the second 20 expenses when given index is 1', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}?pageIndex=1`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheSecondTwentyExpenses(dtos);
            });

            function expectReturnedDtosToBeTheSecondTwentyExpenses(
                dtos: Array<GroupExpenseDTO>,
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
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}?search=${targetExpense.getLabel()}`,
                );

                expect(response.body.length).toBe(1);
                expect(response.body[0].id).toBe(targetExpense.getId());
            });
        });

        function expectReturnedDtosToBeTheFirstTwentyExpenses(
            dtos: Array<GroupExpenseDTO>,
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
            dummyExpenses: Array<GroupExpense>,
        ): Array<GroupExpense> {
            return dummyExpenses.sort(
                (previous, current) =>
                    new Date(current.getCreatedAt()).getTime() -
                    new Date(previous.getCreatedAt()).getTime(),
            );
        }

        function expectReturnedDtosNotToBeUnrelatedExpenses(
            dtos: Array<GroupExpenseDTO>,
        ): void {
            const returnedDtosAreNotUnrelatedExpenses = dtos.every(
                dtoIsNotIn(unrelatedExpenses),
            );

            expect(returnedDtosAreNotUnrelatedExpenses).toBe(true);
        }

        function dtoIsIn(
            expenses: Array<Expense>,
        ): (dto: GroupExpenseDTO) => boolean {
            return (dto: GroupExpenseDTO) =>
                expenses.some((expense) => expense.getId() === dto.id);
        }

        function dtoIsNotIn(
            expenses: Array<Expense>,
        ): (dto: GroupExpenseDTO) => boolean {
            return (dto: GroupExpenseDTO) =>
                expenses.every((expense) => expense.getId() !== dto.id);
        }
    });
});
