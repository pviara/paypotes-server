import { App } from 'supertest/types';
import { SimpleExpense } from '@app/expenses/domain/simple-expense';
import { ExpenseDTO } from '@expenses/presentation/dto/expense.dto';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    expenseSpecModules as modules,
    expenseSpecProviders as providers,
    generateDefaultUserExpenses,
    generateDefaultUserExpense,
    generateRandomStakeholder,
} from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { raw, shutdown } from '@test/helpers/utils';
import * as request from 'supertest';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Stakeholder } from '../domain/stakeholder';
import { generateDefaultUserRandomGroup } from '@test/helpers/group/utils';

describe('ExpenseController', () => {
    const runner = initRunnerWith(modules, providers);

    let expenseRepo: ExpenseInMemoryTestingRepository;
    let httpServer: App;

    beforeAll(async () => {
        await runner.bootstrap();

        expenseRepo = runner.getRepository('expense');
        httpServer = runner.getHttpServer();
    });

    afterAll(shutdown(runner));

    describe('GET /expenses', () => {
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
            let dummyExpenses: Array<SimpleExpense>;

            beforeEach(async () => {
                dummyExpenses = generateDefaultUserExpenses({ length: 40 });

                await expenseRepo.empty();
                await expenseRepo.insert(...dummyExpenses);
            });

            it('should return the first 20 contacts by default', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
            });

            describe('page index has been given', () => {
                it('should return the second 20 expenses when given index is 1', async () => {
                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}?pageIndex=1`,
                    );

                    const dtos = response.body;
                    expect(dtos.length).toBe(20);
                    expectReturnedDtosToBeTheSecondTwentyExpenses(dtos);
                });

                function expectReturnedDtosToBeTheSecondTwentyExpenses(
                    dtos: Array<ExpenseDTO>,
                ): void {
                    const secondTwentyExpenses = dummyExpenses.slice(20, 40);
                    const returnedDtosAreTheSecondTwentyExpenses = dtos.every(
                        dtoIsIn(secondTwentyExpenses),
                    );

                    expect(returnedDtosAreTheSecondTwentyExpenses).toBe(true);
                }
            });

            describe('search has been given', () => {
                it('should return the contacts that match the search', async () => {
                    const targetExpense = dummyExpenses[0];
                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}?search=${targetExpense.getLabel()}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetExpense.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyExpenses(
                dtos: Array<ExpenseDTO>,
            ): void {
                const firstTwentyExpenses = dummyExpenses.slice(0, 20);
                const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
                    dtoIsIn(firstTwentyExpenses),
                );

                expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
            }
        });
    });

    describe('GET /expenses/:id', () => {
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

        it('should return the right expense for given id', async () => {
            const dummyExpense = generateDefaultUserExpense();
            await expenseRepo.insert(dummyExpense);

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/${dummyExpense.getId()}`,
            );

            expect(response.body).toStrictEqual(
                raw(ExpenseDTO.from(dummyExpense)),
            );
        });
    });

    describe('GET /expenses/contact/:contactId/expense/:expenseId', () => {
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

        it('should return the right expense for given contactId and expenseId', async () => {
            const dummyExpense = generateDefaultUserExpense();
            await expenseRepo.insert(dummyExpense);

            const contact = dummyExpense.getCounterpartyOf(
                DEFAULT_USER.getId(),
            );
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${contact.getId()}/expense/${dummyExpense.getId()}`,
            );

            expect(response.body).toStrictEqual(
                raw(ExpenseDTO.from(dummyExpense)),
            );
        });
    });

    describe('GET /expenses/contact/:contactId', () => {
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

        describe('actor has no expense with contact', () => {
            it('should return an empty array', async () => {
                const validContactId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${validContactId}`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('actor has expenses with contact', () => {
            let dummyContactExpenses: Array<SimpleExpense>;
            let dummyContact = generateRandomStakeholder();

            beforeEach(async () => {
                dummyContactExpenses = generateDefaultUserExpenses({
                    length: 40,
                    counterparty: dummyContact,
                });
                await expenseRepo.empty();
                await expenseRepo.insert(...dummyContactExpenses);
            });

            it('should return the first 20 contact expenses by default', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
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
            });

            describe('search has been given', () => {
                it('should return the contact expenses that match the search', async () => {
                    const targetExpense = dummyContactExpenses[0];
                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/contact/${dummyContact.getId()}?search=${targetExpense.getLabel()}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetExpense.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyExpenses(
                dtos: Array<ExpenseDTO>,
            ): void {
                const firstTwentyExpenses = dummyContactExpenses.slice(0, 20);
                const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
                    dtoIsIn(firstTwentyExpenses),
                );

                expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
            }

            function expectReturnedDtosToBeTheSecondTwentyExpenses(
                dtos: Array<ExpenseDTO>,
            ): void {
                const secondTwentyExpenses = dummyContactExpenses.slice(20, 40);
                const returnedDtosAreTheSecondTwentyExpenses = dtos.every(
                    dtoIsIn(secondTwentyExpenses),
                );

                expect(returnedDtosAreTheSecondTwentyExpenses).toBe(true);
            }
        });
    });

    describe('GET /expenses/group/:groupId/expense/:expenseId', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
            async (groupId: unknown) => {
                const validId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${groupId}/expense/${validId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
            async (expenseId: unknown) => {
                const validId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${validId}/expense/${expenseId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('should return the right expense for given groupId and expenseId', async () => {
            const dummyGroup = generateDefaultUserRandomGroup();
            const dummyExpense = generateDefaultUserExpense(dummyGroup);
            await expenseRepo.insert(dummyExpense);

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
            );

            expect(response.body).toStrictEqual(
                raw(ExpenseDTO.from(dummyExpense)),
            );
        });
    });

    describe('GET /expenses/group/:groupId', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
            async (groupId: unknown) => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${groupId}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('actor has no expense with group', () => {
            it('should return an empty array', async () => {
                const validGroupId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${validGroupId}`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('actor has expenses with group', () => {
            let dummyGroupExpenses: Array<SimpleExpense>;
            let dummyGroup = generateDefaultUserRandomGroup();

            beforeEach(async () => {
                dummyGroupExpenses = generateDefaultUserExpenses({
                    length: 40,
                    group: dummyGroup,
                });
                await expenseRepo.empty();
                await expenseRepo.insert(...dummyGroupExpenses);
            });

            it('should return the first 20 group expenses by default', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
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
            });

            describe('search has been given', () => {
                it('should return the group expenses that match the search', async () => {
                    const targetExpense = dummyGroupExpenses[0];
                    const response = await request(httpServer).get(
                        `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}?search=${targetExpense.getLabel()}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetExpense.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyExpenses(
                dtos: Array<ExpenseDTO>,
            ): void {
                const firstTwentyExpenses = dummyGroupExpenses.slice(0, 20);
                const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
                    dtoIsIn(firstTwentyExpenses),
                );

                expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
            }

            function expectReturnedDtosToBeTheSecondTwentyExpenses(
                dtos: Array<ExpenseDTO>,
            ): void {
                const secondTwentyExpenses = dummyGroupExpenses.slice(20, 40);
                const returnedDtosAreTheSecondTwentyExpenses = dtos.every(
                    dtoIsIn(secondTwentyExpenses),
                );

                expect(returnedDtosAreTheSecondTwentyExpenses).toBe(true);
            }
        });
    });

    function dtoIsIn(
        expenses: Array<SimpleExpense>,
    ): (dto: ExpenseDTO) => boolean {
        return (dto: ExpenseDTO) =>
            expenses.some((expense) => expense.getId() === dto.id);
    }
});
