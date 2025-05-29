import { App } from 'supertest/types';
import { convertCents, raw, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    expenseSpecModules as modules,
    expenseSpecProviders as providers,
    generateDefaultUserPairExpenses,
    generateDefaultUserPairExpense,
    generateDefaultUserGroupExpenses,
    generateDefaultUserGroupExpense,
    generateRandomBoolean,
    generateRandomStakeholders,
} from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import {
    generateDefaultUserRandomGroup,
    generateDefaultUserRandomGroups,
} from '@test/helpers/group/utils';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/group-expense';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import {
    generateRandomUser,
    generateRandomUsers,
} from '@test/helpers/user/utils';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { Member } from '@groups/domain/member';
import { PairExpense } from '@expenses/domain/pair-expense';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import * as request from 'supertest';
import { Calculator } from '../domain/calculator';
import { PairExpensePerspectiveView } from '../domain/pair-expense-perspective-view';
import { Contact } from '@app/contacts/domain/contact';
import { User } from '@app/users/domain/user';

describe('ExpenseController', () => {
    const runner = initRunnerWith(modules, providers);

    let expenseRepo: ExpenseInMemoryTestingRepository;
    let groupRepo: GroupInMemoryTestingRepository;
    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await runner.bootstrap();

        expenseRepo = runner.getRepository('expense');
        groupRepo = runner.getRepository('group');
        userRepo = runner.getRepository('user');
        httpServer = runner.getHttpServer();
    });

    afterEach(shutdown(runner));

    describe('DELETE /expenses/:expenseId', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).delete(
                    `/${EXPENSES_API_ROUTE}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('actor expense does not exist', () => {
            beforeEach(async () => {
                await expenseRepo.empty();
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();

                const response = await request(httpServer).delete(
                    `/${EXPENSES_API_ROUTE}/${NOT_EXISTING_ID}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        describe('actor expense exists', () => {
            const dummyGroup = generateDefaultUserRandomGroup();
            const dummyExpense = generateRandomBoolean()
                ? generateDefaultUserPairExpense()
                : generateDefaultUserGroupExpense(dummyGroup);

            beforeEach(async () => {
                await groupRepo.empty();
                await groupRepo.insert(dummyGroup);

                await expenseRepo.empty();
                await expenseRepo.insert(dummyExpense);
            });

            it('should have settled the right expense', async () => {
                const actorId = DEFAULT_USER.getId();
                const expenseId = dummyExpense.getId();
                const expense = await expenseRepo.getActorExpenseById(
                    actorId,
                    expenseId,
                );
                expect(expense).toBeDefined();

                await request(httpServer).delete(
                    `/${EXPENSES_API_ROUTE}/${expenseId}`,
                );

                const updatedExpense = await expenseRepo.get(expenseId);
                expect(updatedExpense?.getShareOf(actorId)).toBe(0);
            });
        });
    });

    describe('GET /balance', () => {
        describe('actor has no expense at all', () => {
            it('should return default balance "0,00"', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/balance`,
                );

                expect(response.text).toBe('0,00');
            });
        });

        describe('actor has expenses with multiple groups and contacts', () => {
            let allDummyContactExpenses: Array<PairExpense[]>;
            let allDummyGroupExpenses: Array<GroupExpense[]>;

            const dummyContacts = generateRandomUsers({ length: 4 });
            const dummyGroups = generateDefaultUserRandomGroups({ length: 4 });

            beforeEach(async () => {
                allDummyContactExpenses = dummyContacts.map((contact) =>
                    generateDefaultUserPairExpenses({
                        length: 4,
                        counterparty: contact,
                    }),
                );

                allDummyGroupExpenses = dummyGroups.map((group) =>
                    generateDefaultUserGroupExpenses({
                        length: 4,
                        group: group,
                    }),
                );

                await expenseRepo.empty();
                await expenseRepo.insert(...allDummyContactExpenses.flat());
                await expenseRepo.insert(...allDummyGroupExpenses.flat());
            });

            it('should return the total balance from all expenses', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/balance`,
                );

                const totalBalance = computeTotalBalance();
                const expected = `${convertCents(totalBalance)}`.replace(
                    '.',
                    ',',
                );

                expect(response.text).toBe(expected);
            });

            function computeTotalBalance(): number {
                const pairExpensesBalance =
                    computeActorAllDummyContactsBalance();
                const groupExpensesBalance =
                    computeActorAllDummyGroupsBalance();
                return pairExpensesBalance + groupExpensesBalance;
            }

            function computeActorAllDummyContactsBalance(): number {
                const flattenContactExpenses = allDummyContactExpenses.flat();
                return new Calculator(flattenContactExpenses).calculateFor(
                    DEFAULT_USER.getId(),
                );
            }

            function computeActorAllDummyGroupsBalance(): number {
                const flattenContactExpenses = allDummyGroupExpenses.flat();
                return new Calculator(flattenContactExpenses).calculateFor(
                    DEFAULT_USER.getId(),
                );
            }
        });
    });

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
            let dummyExpenses: Array<PairExpense>;

            beforeEach(async () => {
                dummyExpenses = generateDefaultUserPairExpenses({ length: 40 });

                await expenseRepo.empty();
                await expenseRepo.insert(...dummyExpenses);
            });

            it('should return the first 20 expenses by default', async () => {
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
                    dtos: Array<PairExpenseDTO>,
                ): void {
                    const secondTwentyExpenses = dummyExpenses.slice(20, 40);
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
                        `/${EXPENSES_API_ROUTE}?search=${targetExpense.getLabel()}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetExpense.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyExpenses(
                dtos: Array<PairExpenseDTO>,
            ): void {
                const firstTwentyExpenses = dummyExpenses.slice(0, 20);
                const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
                    dtoIsIn(firstTwentyExpenses),
                );

                expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
            }
        });

        describe('actor has only settled expenses', () => {
            let dummyPairExpenses: Array<PairExpense>;
            let dummyGroupExpenses: Array<GroupExpense>;

            beforeEach(async () => {
                const dummyGroup = generateDefaultUserRandomGroup();
                dummyGroupExpenses = generateDefaultUserGroupExpenses({
                    length: 10,
                    group: dummyGroup,
                });
                dummyPairExpenses = generateDefaultUserPairExpenses({
                    length: 10,
                });

                const dummyExpenses = [
                    ...dummyGroupExpenses,
                    ...dummyPairExpenses,
                ];

                await expenseRepo.empty();
                await expenseRepo.insert(...dummyExpenses);
                await paybackAllExpenses();
            });

            it('should return no expense', async () => {
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}`,
                );

                expect(response.body.length).toBe(0);
            });

            async function paybackAllExpenses(): Promise<void> {
                for (const expense of [
                    ...dummyPairExpenses,
                    ...dummyGroupExpenses,
                ]) {
                    await request(httpServer).delete(
                        `/${EXPENSES_API_ROUTE}/${expense.getId()}`,
                    );
                }
            }
        });
    });

    describe('GET /expenses/:expenseId', () => {
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

        describe('actor expense does not exist', () => {
            beforeEach(async () => {
                await expenseRepo.empty();
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/${NOT_EXISTING_ID}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        it('should return the right expense for given id', async () => {
            const dummyExpense = generateDefaultUserPairExpense();
            await expenseRepo.insert(dummyExpense);

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/${dummyExpense.getId()}`,
            );

            const expenseView = PairExpensePerspectiveView.from(
                dummyExpense,
                DEFAULT_USER.getId(),
            );
            expect(response.body).toStrictEqual(
                raw(PairExpenseDTO.from(expenseView)),
            );
        });

        describe('expense is settled', () => {
            it('should return 404 NOT_FOUND', async () => {
                const dummyExpense = generateDefaultUserPairExpense();
                await expenseRepo.insert(dummyExpense);
                await payback(dummyExpense);

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });
    });

    describe('GET /expenses/contact/:contactId', () => {
        describe('actor has no expense with contact', () => {
            it('should return an empty array', async () => {
                const dummyContactId = crypto.randomUUID();
                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${dummyContactId}`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('actor has expenses with contact', () => {
            let dummyContact: User;
            let dummyExpenses: Array<PairExpense>;
            let unrelatedExpenses: Array<PairExpense>;

            beforeEach(async () => {
                dummyContact = generateRandomUser();
                dummyExpenses = generateDefaultUserPairExpenses({
                    length: 40,
                    counterparty: dummyContact,
                });

                unrelatedExpenses = generateDefaultUserPairExpenses({
                    length: 10,
                });

                await expenseRepo.insert(
                    ...dummyExpenses.concat(unrelatedExpenses),
                );
            });

            it('should return the first 20 contacts by default', async () => {
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
                    const secondTwentyExpenses = dummyExpenses.slice(20, 40);
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
                const firstTwentyExpenses = dummyExpenses.slice(0, 20);
                const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
                    dtoIsIn(firstTwentyExpenses),
                );

                expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
            }

            function expectReturnedDtosNotToBeUnrelatedExpenses(
                dtos: Array<PairExpenseDTO>,
            ): void {
                const returnedDtosAreNotUnrelatedExpenses = dtos.every(
                    dtoIsNotIn(unrelatedExpenses),
                );

                expect(returnedDtosAreNotUnrelatedExpenses).toBe(true);
            }
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
            const dummyExpense = generateDefaultUserPairExpense();
            await expenseRepo.insert(dummyExpense);

            const contact = dummyExpense.getCounterpartyOf(
                DEFAULT_USER.getId(),
            );
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${contact.getId()}/expense/${dummyExpense.getId()}`,
            );

            const expenseView = PairExpensePerspectiveView.from(
                dummyExpense,
                DEFAULT_USER.getId(),
            );
            expect(response.body).toStrictEqual(
                raw(PairExpenseDTO.from(expenseView)),
            );
        });

        describe('expense is settled', () => {
            it('should return 404 NOT_FOUND', async () => {
                const dummyExpense = generateDefaultUserPairExpense();
                const contact = dummyExpense.getCounterpartyOf(
                    DEFAULT_USER.getId(),
                );

                await expenseRepo.insert(dummyExpense);
                await payback(dummyExpense);

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/contact/${contact.getId()}/expense/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
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
            const dummyExpense = generateDefaultUserGroupExpense(dummyGroup);
            await expenseRepo.insert(dummyExpense);

            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
            );

            expect(response.body.id).toBe(dummyExpense.getId());
            expect(response.body.label).toBe(dummyExpense.getLabel());
            expect(response.body.emoji).toBe(dummyExpense.getEmoji());
        });

        describe('expense is settled', () => {
            it('should return 404 NOT_FOUND', async () => {
                const dummyGroup = generateDefaultUserRandomGroup();
                const dummyExpense =
                    generateDefaultUserGroupExpense(dummyGroup);

                await expenseRepo.insert(dummyExpense);
                await payback(dummyExpense);

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });
    });

    describe('POST /expenses/group', () => {
        const invalidPayloads: NonNullable<unknown>[] = [
            '',
            {},
            { id: 'not-a-uuid' },
            { id: crypto.randomUUID() },
            { id: crypto.randomUUID(), label: '' },
            { id: crypto.randomUUID(), label: 'Label', emoji: 'not-an-emoji' },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: 'not-a-number',
                groupId: crypto.randomUUID(),
                memberId: crypto.randomUUID(),
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                groupId: 'not-a-uuid',
                memberId: crypto.randomUUID(),
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                groupId: crypto.randomUUID(),
                memberId: 'not-a-uuid',
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                groupId: crypto.randomUUID(),
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                memberId: crypto.randomUUID(),
            },
        ];

        it.each(invalidPayloads)(
            'should return 400 BAD_REQUEST when given payload "%s" is invalid',
            async (payload: NonNullable<unknown>) => {
                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/group`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('expense group does not exist', () => {
            beforeEach(async () => {
                await groupRepo.empty();
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();

                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/group`)
                    .send({
                        id: crypto.randomUUID(),
                        label: 'Label',
                        emoji: '😀',
                        balance: '100',
                        groupId: NOT_EXISTING_ID,
                        memberId: NOT_EXISTING_ID,
                    });

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        describe('expense member does not exist in group', () => {
            const dummyGroup = generateDefaultUserRandomGroup();

            beforeEach(async () => {
                await groupRepo.empty();
                await groupRepo.save(dummyGroup);
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();

                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/group`)
                    .send({
                        id: crypto.randomUUID(),
                        label: 'Label',
                        emoji: '😀',
                        balance: '100',
                        groupId: dummyGroup.getId(),
                        memberId: NOT_EXISTING_ID,
                    });

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        describe('both group and group member exist', () => {
            const dummyGroup = generateDefaultUserRandomGroup();
            const dummyMember = getAnyMemberFrom(dummyGroup);

            beforeEach(async () => {
                await groupRepo.empty();
                await groupRepo.save(dummyGroup);
            });

            it('should save a group expense in database', async () => {
                const expenseId = crypto.randomUUID();
                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/group`)
                    .send({
                        id: expenseId,
                        label: 'Label',
                        emoji: '😀',
                        balance: '100',
                        groupId: dummyGroup.getId(),
                        memberId: dummyMember.getId(),
                    });

                expect(response.status).toBe(HttpStatus.CREATED);
                expect(expenseRepo.expenseSaved(expenseId));
            });

            function getAnyMemberFrom(group: Group): Member {
                const members = group.getMembers();
                const index = Math.floor(Math.random() * members.length);
                return members[index];
            }
        });
    });

    describe('POST /expenses/pair', () => {
        const invalidPayloads: NonNullable<unknown>[] = [
            '',
            {},
            { id: 'not-a-uuid' },
            { id: crypto.randomUUID() },
            { id: crypto.randomUUID(), label: '' },
            { id: crypto.randomUUID(), label: 'Label', emoji: 'not-an-emoji' },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: 'not-a-number',
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                isCurrentPayer: 'not-a-boolean',
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                isCurrentPayer: true,
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: '100',
                isCurrentPayer: true,
                userId: 'not-a-uuid',
            },
            {
                id: crypto.randomUUID(),
                label: 'Label',
                emoji: '😀',
                balance: 'not-a-number',
                isCurrentPayer: true,
                userId: crypto.randomUUID(),
            },
        ];

        it.each(invalidPayloads)(
            'should return 400 BAD_REQUEST when given payload "%s" is invalid',
            async (payload: NonNullable<unknown>) => {
                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/pair`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('expense user exists', () => {
            const dummyUser = generateRandomUser();

            beforeEach(async () => {
                await userRepo.empty();
                await userRepo.insert(dummyUser);
            });

            it('should insert a pair expense in database', async () => {
                const expenseId = crypto.randomUUID();
                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/pair`)
                    .send({
                        id: expenseId,
                        label: 'Label',
                        emoji: '📦',
                        balance: '14,75',
                        isCurrentPayer: true,
                        userId: dummyUser.getId(),
                    });

                expect(response.status).toBe(HttpStatus.CREATED);
                expect(expenseRepo.expenseSaved(expenseId)).toBe(true);
            });
        });

        describe('expense user does not exist', () => {
            beforeEach(async () => {
                await userRepo.empty();
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();

                const response = await request(httpServer)
                    .post(`/${EXPENSES_API_ROUTE}/pair`)
                    .send({
                        id: crypto.randomUUID(),
                        label: 'Label',
                        emoji: '📦',
                        balance: '14,75',
                        isCurrentPayer: true,
                        userId: NOT_EXISTING_ID,
                    });

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });
    });

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

    async function payback(expense: Expense): Promise<void> {
        await request(httpServer).delete(
            `/${EXPENSES_API_ROUTE}/${expense.getId()}`,
        );
    }
});
