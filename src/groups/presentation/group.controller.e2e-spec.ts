import { App } from 'supertest/types';
import { convertCents, mapIdsFrom, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    generateDefaultUserRandomGroup,
    generateDefaultUserRandomGroups,
    groupSpecModules as modules,
    groupSpecProviders as providers,
} from '@test/helpers/group/utils';
import {
    generateDefaultUserGroupExpenses,
    generateRandomMetadata,
    generateRandomStakeholder,
} from '@test/helpers/expense/utils';
import { generateRandomUsers } from '@test/helpers/user/utils';
import { Group } from '@groups/domain/group';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import { GroupWithBalanceDTO } from '@groups/presentation/dto/group-with-balance.dto';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import * as request from 'supertest';

describe('GroupController', () => {
    const runner = initRunnerWith(modules, providers);

    let groupRepo: GroupInMemoryTestingRepository;
    let expenseRepo: ExpenseInMemoryTestingRepository;
    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await runner.bootstrap();

        groupRepo = runner.getRepository('group');
        expenseRepo = runner.getRepository('expense');
        userRepo = runner.getRepository('user');
        httpServer = runner.getHttpServer();
    });

    afterEach(shutdown(runner));

    describe('GET /groups', () => {
        describe('actor has no groups', () => {
            it('should return an empty array', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('actor has groups', () => {
            let dummyGroups: Array<Group>;

            beforeEach(() => {
                dummyGroups = generateDefaultUserRandomGroups({
                    length: 40,
                });

                groupRepo.empty();
                groupRepo.insert(...dummyGroups);
            });

            it('should return the first 20 groups by default', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyGroups(dtos);
            });

            describe('page index has been given', () => {
                it('should return the second 20 groups when given index is 1', async () => {
                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}?pageIndex=1`,
                    );

                    const dtos = response.body;
                    expect(dtos.length).toBe(20);
                    expectReturnedDtosToBeTheSecondTwentyGroups(dtos);
                });

                function expectReturnedDtosToBeTheSecondTwentyGroups(
                    dtos: Array<GroupDTO>,
                ): void {
                    const secondTwentyGroups = dummyGroups.slice(20, 40);
                    const returnedDtosAreTheSecondTwentyGroups = dtos.every(
                        dtoIsIn(secondTwentyGroups),
                    );

                    expect(returnedDtosAreTheSecondTwentyGroups).toBe(true);
                }
            });

            describe('search has been given', () => {
                it('should return the groups that match the search', async () => {
                    const targetGroup = dummyGroups[0];
                    const search = targetGroup.getName();

                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}?search=${search}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetGroup.getId());
                });
            });

            describe('actor has only groups with no expense', () => {
                it('should return the groups with default zero balance', async () => {
                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}`,
                    );

                    const dtos = response.body;
                    expectAllReturnedDtosToHaveDefaultZeroBalance(dtos);
                });

                function expectAllReturnedDtosToHaveDefaultZeroBalance(
                    dtos: Array<GroupWithBalanceDTO>,
                ): void {
                    dtos.forEach((dto) => expect(dto.balance).toBe('0,00'));
                }
            });

            describe('actor has groups with expenses', () => {
                beforeEach(async () => {
                    const expenses = dummyGroups.flatMap((group) => {
                        return [
                            createRandomCreditExpenseFor(group, 894),
                            createRandomDebitExpenseFor(group, 145),
                            createRandomDebitExpenseFor(group, 311),
                            createRandomCreditExpenseFor(group, 28),
                        ];
                    });

                    await expenseRepo.empty();
                    await expenseRepo.insert(...expenses);
                });

                it('should return the groups with the right balance', async () => {
                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}`,
                    );

                    const dtos = response.body;
                    expectAllReturnedDtosToHaveRightBalance(dtos);
                });

                function createRandomCreditExpenseFor(
                    group: Group,
                    balance: number,
                ): GroupExpense {
                    const metadata = generateRandomMetadata();
                    const payment: GroupPayment = {
                        balance,
                        creditor: Stakeholder.from(DEFAULT_USER),
                    };
                    return new GroupExpense(metadata, group, payment);
                }

                function createRandomDebitExpenseFor(
                    group: Group,
                    balance: number,
                ): GroupExpense {
                    const metadata = generateRandomMetadata();
                    const payment: GroupPayment = {
                        balance,
                        creditor: generateRandomStakeholder(),
                    };
                    return new GroupExpense(metadata, group, payment);
                }

                function expectAllReturnedDtosToHaveRightBalance(
                    dtos: Array<GroupWithBalanceDTO>,
                ): void {
                    const balance = 894 - 145 - 311 + 28;
                    const expected = `${convertCents(balance)}`.replace(
                        '.',
                        ',',
                    );
                    dtos.forEach((dto) => expect(dto.balance).toBe(expected));
                }
            });

            function expectReturnedDtosToBeTheFirstTwentyGroups(
                dtos: Array<GroupDTO>,
            ): void {
                const firstTwentyGroups = dummyGroups.slice(0, 20);
                const returnedDtosAreTheFirstTwentyGroups = dtos.every(
                    dtoIsIn(firstTwentyGroups),
                );

                expect(returnedDtosAreTheFirstTwentyGroups).toBe(true);
            }

            function dtoIsIn(groups: Array<Group>): (dto: GroupDTO) => boolean {
                return (dto: GroupDTO) =>
                    groups.some((group) => group.getId() === dto.id);
            }
        });
    });

    describe('GET /groups/:id', () => {
        let dummyGroup: Group;

        beforeEach(async () => {
            dummyGroup = generateDefaultUserRandomGroup();
            await groupRepo.insert(dummyGroup);
        });

        const invalidIds = ['id', null, 59391, NaN, undefined];
        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('actor has no expense in group', () => {
            it('should return default balance "0,00"', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/${dummyGroup.getId()}`,
                );

                expect(response.body.id).toBe(dummyGroup.getId());
                expect(response.body.name).toBe(dummyGroup.getName());
                expect(response.body.emoji).toBe(dummyGroup.getEmoji());
                expect(response.body.balance).toBe('0,00');
            });
        });

        describe('actor has expenses in group', () => {
            let dummyGroupExpenses: Array<GroupExpense>;

            beforeEach(async () => {
                dummyGroupExpenses = generateDefaultUserGroupExpenses({
                    length: 10,
                    group: dummyGroup,
                });
                await expenseRepo.empty();
                await expenseRepo.insert(...dummyGroupExpenses);
            });

            it('should return the right balance', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/${dummyGroup.getId()}`,
                );

                const balance = computeActorDummyGroupBalance();
                const expected = `${convertCents(balance)}`.replace('.', ',');

                expect(response.body.balance).toBe(expected);
            });

            function computeActorDummyGroupBalance(): number {
                return dummyGroupExpenses.reduce(
                    computeExpenseBalanceFor(DEFAULT_USER.getId()),
                    0,
                );
            }

            function computeExpenseBalanceFor(
                actorId: string,
            ): (balance: number, expense: GroupExpense) => number {
                return (balance, expense) => {
                    const expenseBalance = expense.getRawBalance();
                    const actorBalance = expense.hasCreditor(actorId)
                        ? expenseBalance
                        : -expenseBalance;

                    return balance + actorBalance;
                };
            }
        });
    });

    describe('GET /groups/without-balance', () => {
        describe('actor has no group', () => {
            it('should return an empty array', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/without-balance`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('actor has groups', () => {
            let dummyGroups: Array<Group>;

            beforeEach(() => {
                dummyGroups = generateDefaultUserRandomGroups({
                    length: 40,
                });

                groupRepo.empty();
                groupRepo.insert(...dummyGroups);
            });

            it('should return the first 20 groups by default', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/without-balance`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyGroups(dtos);
            });

            describe('page index has been given', () => {
                it('should return the second 20 groups when given index is 1', async () => {
                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}/without-balance?pageIndex=1`,
                    );

                    const dtos = response.body;
                    expect(dtos.length).toBe(20);
                    expectReturnedDtosToBeTheSecondTwentyGroups(dtos);
                });

                function expectReturnedDtosToBeTheSecondTwentyGroups(
                    dtos: Array<GroupDTO>,
                ): void {
                    const secondTwentyGroups = dummyGroups.slice(20, 40);
                    const returnedDtosAreTheSecondTwentyGroups = dtos.every(
                        dtoIsIn(secondTwentyGroups),
                    );

                    expect(returnedDtosAreTheSecondTwentyGroups).toBe(true);
                }
            });

            describe('search has been given', () => {
                it('should return the groups that match the search', async () => {
                    const targetGroup = dummyGroups[0];
                    const search = targetGroup.getName();

                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}/without-balance?search=${search}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetGroup.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyGroups(
                dtos: Array<GroupDTO>,
            ): void {
                const firstTwentyGroups = dummyGroups.slice(0, 20);
                const returnedDtosAreTheFirstTwentyGroups = dtos.every(
                    dtoIsIn(firstTwentyGroups),
                );

                expect(returnedDtosAreTheFirstTwentyGroups).toBe(true);
            }

            function dtoIsIn(groups: Array<Group>): (dto: GroupDTO) => boolean {
                return (dto: GroupDTO) =>
                    groups.some((group) => group.getId() === dto.id);
            }
        });
    });

    describe('POST /groups', () => {
        const dummyGroupMembers = generateRandomUsers({ length: 4 });
        const invalidPayloads: NonNullable<unknown>[] = [
            '',
            {},
            { a: 'A' },
            { name: 'name', emoji: '', userIds: [] },
            { name: 'name', emoji: '📦', userIds: [] },
            { name: 'name', emoji: '📦', userIds: ['invalid_uuid'] },
        ];

        it.each(invalidPayloads)(
            'should return 400 BAD_REQUEST when given payload "%s" is invalid',
            async (payload: NonNullable<unknown>) => {
                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('all group members exist', () => {
            beforeEach(async () => {
                await userRepo.empty();
                await userRepo.insert(...dummyGroupMembers);
            });

            it('should insert a group in database', async () => {
                const groupId = crypto.randomUUID();
                const userIds = mapIdsFrom(dummyGroupMembers);

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({
                        id: groupId,
                        name: 'name',
                        emoji: '🏕️',
                        userIds,
                    });

                expect(response.status).toBe(HttpStatus.CREATED);
                expect(groupRepo.groupSaved(groupId)).toBe(true);
            });
        });

        describe("some group members don't exist", () => {
            beforeEach(async () => {
                await userRepo.empty();
                await userRepo.insert(...dummyGroupMembers);
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();
                const userIds = [
                    ...mapIdsFrom(dummyGroupMembers),
                    NOT_EXISTING_ID,
                ];

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({
                        id: crypto.randomUUID(),
                        name: 'name',
                        emoji: '✈️',
                        userIds,
                    });

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });
    });
});
