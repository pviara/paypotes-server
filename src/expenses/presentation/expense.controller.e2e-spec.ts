import { App } from 'supertest/types';
import { Balance } from '@expenses/domain/balance/balance';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { convertCents, raw, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    expenseSpecModules as modules,
    expenseSpecProviders as providers,
    generateDefaultUserPairExpenses,
    generateDefaultUserPairExpense,
    generateDefaultUserGroupExpenses,
    generateDefaultUserGroupExpense,
    generateRandomMetadata,
    generateRandomBalance,
} from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import {
    generateDefaultUserRandomGroup,
    generateDefaultUserRandomGroups,
    generateRandomMember,
} from '@test/helpers/group/utils';
import {
    generateRandomUser,
    generateRandomUsers,
    mapUsersFrom,
} from '@test/helpers/user/utils';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { Member } from '@groups/domain/member';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';
import { StakeholderDTO } from '@expenses/presentation/dto/stakeholder.dto';
import { User } from '@users/domain/user';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import * as request from 'supertest';

describe('ExpenseController', () => {
    const application = initApplicationWith(modules);

    let expenseRepo: ExpensePostgresTestingRepository;
    let groupRepo: GroupPostgresTestingRepository;
    let userRepo: UserPostgresTestingRepository;
    let httpServer: App;

    const actorId = DEFAULT_USER.getId();

    beforeAll(async () => {
        await application.bootstrap();

        ({ expenseRepo, groupRepo, userRepo } = application.getRepositories());
        httpServer = application.getHttpServer();
    });

    afterAll(shutdown(application));

    beforeEach(async () => {
        await expenseRepo.empty();
        await groupRepo.empty();
        await userRepo.empty();
    });

    afterEach(async () => {
        await expenseRepo.empty();
        await groupRepo.empty();
        await userRepo.empty();
    });

    // describe('GET /balance', () => {
    //     describe('actor has no expense at all', () => {
    //         it('should return default balance "0,00"', async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}/balance`,
    //             );

    //             expect(response.text).toBe('0,00');
    //         });
    //     });

    //     describe('actor has expenses with multiple groups and contacts', () => {
    //         let allDummyContactExpenses: Array<PairExpense[]>;
    //         let allDummyGroupExpenses: Array<GroupExpense[]>;

    //         const dummyContacts = generateRandomUsers({ length: 4 });
    //         const dummyGroups = generateDefaultUserRandomGroups({ length: 4 });

    //         beforeEach(async () => {
    //             allDummyContactExpenses = dummyContacts.map((contact) =>
    //                 generateDefaultUserPairExpenses({
    //                     length: 4,
    //                     counterparty: contact,
    //                 }),
    //             );

    //             allDummyGroupExpenses = dummyGroups.map((group) =>
    //                 generateDefaultUserGroupExpenses({
    //                     length: 4,
    //                     group: group,
    //                 }),
    //             );

    //             await expenseRepo.empty();
    //             await expenseRepo.insert(...allDummyContactExpenses.flat());
    //             await expenseRepo.insert(...allDummyGroupExpenses.flat());
    //         });

    //         it('should return the total balance from all expenses', async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}/balance`,
    //             );

    //             const totalBalance = computeTotalBalance();
    //             const expected =
    //                 `${convertCents(totalBalance).toFixed(2)}`.replace(
    //                     '.',
    //                     ',',
    //                 );

    //             expect(response.text).toBe(expected);
    //         });

    //         function computeTotalBalance(): number {
    //             const pairExpensesBalance =
    //                 computeActorAllDummyContactsBalance();
    //             const groupExpensesBalance =
    //                 computeActorAllDummyGroupsBalance();
    //             return pairExpensesBalance + groupExpensesBalance;
    //         }

    //         function computeActorAllDummyContactsBalance(): number {
    //             const flattenContactExpenses = allDummyContactExpenses.flat();
    //             return Balance.calculate({
    //                 expenses: flattenContactExpenses,
    //                 stakeholderId: DEFAULT_USER.getId(),
    //             });
    //         }

    //         function computeActorAllDummyGroupsBalance(): number {
    //             const flattenContactExpenses = allDummyGroupExpenses.flat();
    //             return Balance.calculate({
    //                 expenses: flattenContactExpenses,
    //                 stakeholderId: DEFAULT_USER.getId(),
    //             });
    //         }
    //     });
    // });

    // describe('GET /expenses', () => {
    //     describe('actor has no expense', () => {
    //         it('should return an empty array', async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}`,
    //             );

    //             expect(response.status).toBe(HttpStatus.OK);
    //             expect(response.body.length).toBe(0);
    //         });
    //     });

    //     describe('actor has expenses', () => {
    //         let dummyExpenses: Array<PairExpense>;

    //         beforeEach(async () => {
    //             dummyExpenses = generateDefaultUserPairExpenses({ length: 40 });

    //             await expenseRepo.empty();
    //             await expenseRepo.insert(...dummyExpenses);
    //         });

    //         it('should return the first 20 expenses by default', async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}`,
    //             );

    //             const dtos = response.body;
    //             expect(dtos.length).toBe(20);
    //             expectReturnedDtosToBeTheFirstTwentyExpenses(dtos);
    //         });

    //         describe('page index has been given', () => {
    //             it('should return the second 20 expenses when given index is 1', async () => {
    //                 const response = await request(httpServer).get(
    //                     `/${EXPENSES_API_ROUTE}?pageIndex=1`,
    //                 );

    //                 const dtos = response.body;
    //                 expect(dtos.length).toBe(20);
    //                 expectReturnedDtosToBeTheSecondTwentyExpenses(dtos);
    //             });

    //             function expectReturnedDtosToBeTheSecondTwentyExpenses(
    //                 dtos: Array<PairExpenseDTO>,
    //             ): void {
    //                 const secondTwentyExpenses = dummyExpenses.slice(20, 40);
    //                 const returnedDtosAreTheSecondTwentyExpenses = dtos.every(
    //                     dtoIsIn(secondTwentyExpenses),
    //                 );

    //                 expect(returnedDtosAreTheSecondTwentyExpenses).toBe(true);
    //             }
    //         });

    //         describe('search has been given', () => {
    //             it('should return the expenses that match the search', async () => {
    //                 const targetExpense = dummyExpenses[0];
    //                 const response = await request(httpServer).get(
    //                     `/${EXPENSES_API_ROUTE}?search=${targetExpense.getLabel()}`,
    //                 );

    //                 expect(response.body.length).toBe(1);
    //                 expect(response.body[0].id).toBe(targetExpense.getId());
    //             });
    //         });

    //         function expectReturnedDtosToBeTheFirstTwentyExpenses(
    //             dtos: Array<PairExpenseDTO>,
    //         ): void {
    //             const firstTwentyExpenses = dummyExpenses.slice(0, 20);
    //             const returnedDtosAreTheFirstTwentyExpenses = dtos.every(
    //                 dtoIsIn(firstTwentyExpenses),
    //             );

    //             expect(returnedDtosAreTheFirstTwentyExpenses).toBe(true);
    //         }
    //     });

    //     describe('actor has only settled expenses', () => {
    //         let dummyPairExpenses: Array<PairExpense>;
    //         let dummyGroupExpenses: Array<GroupExpense>;

    //         beforeEach(async () => {
    //             const dummyGroup = generateDefaultUserRandomGroup();
    //             dummyGroupExpenses = generateDefaultUserGroupExpenses({
    //                 length: 10,
    //                 group: dummyGroup,
    //             });
    //             dummyPairExpenses = generateDefaultUserPairExpenses({
    //                 length: 10,
    //             });

    //             const dummyExpenses = [
    //                 ...dummyGroupExpenses,
    //                 ...dummyPairExpenses,
    //             ];

    //             await expenseRepo.empty();
    //             await expenseRepo.insert(...dummyExpenses);
    //             await paybackAllExpenses();
    //         });

    //         it('should return no expense', async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}`,
    //             );

    //             expect(response.body.length).toBe(0);
    //         });

    //         async function paybackAllExpenses(): Promise<void> {
    //             for (const expense of dummyGroupExpenses)
    //                 await paybackGroupExpense(expense);

    //             for (const expense of dummyPairExpenses)
    //                 await paybackPairExpense(expense);
    //         }
    //     });
    // });

    // describe('POST /expenses/group', () => {
    //     const invalidPayloads: NonNullable<unknown>[] = [
    //         '',
    //         {},
    //         { id: 'not-a-uuid' },
    //         { id: crypto.randomUUID() },
    //         { id: crypto.randomUUID(), label: '' },
    //         { id: crypto.randomUUID(), label: 'Label', emoji: 'not-an-emoji' },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: 'not-a-number',
    //             groupId: crypto.randomUUID(),
    //             memberId: crypto.randomUUID(),
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             groupId: 'not-a-uuid',
    //             memberId: crypto.randomUUID(),
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             groupId: crypto.randomUUID(),
    //             memberId: 'not-a-uuid',
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             groupId: crypto.randomUUID(),
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             memberId: crypto.randomUUID(),
    //         },
    //     ];

    //     it.each(invalidPayloads)(
    //         'should return 400 BAD_REQUEST when given payload "%s" is invalid',
    //         async (payload: NonNullable<unknown>) => {
    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/group`)
    //                 .send(payload);

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     describe('expense group does not exist', () => {
    //         beforeEach(async () => {
    //             await groupRepo.empty();
    //         });

    //         it('should return 404 NOT_FOUND', async () => {
    //             const NOT_EXISTING_ID = crypto.randomUUID();

    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/group`)
    //                 .send({
    //                     id: crypto.randomUUID(),
    //                     label: 'Label',
    //                     emoji: '😀',
    //                     balance: '100',
    //                     groupId: NOT_EXISTING_ID,
    //                     memberId: NOT_EXISTING_ID,
    //                 });

    //             expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //         });
    //     });

    //     describe('expense member does not exist in group', () => {
    //         const dummyGroup = generateDefaultUserRandomGroup();

    //         beforeEach(async () => {
    //             await groupRepo.empty();
    //             await userRepo.empty();

    //             const users = mapUsersFrom(dummyGroup.getMembers());
    //             await userRepo.insert(...users);
    //             await groupRepo.save(dummyGroup);
    //         });

    //         it('should return 404 NOT_FOUND', async () => {
    //             const NOT_EXISTING_ID = crypto.randomUUID();

    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/group`)
    //                 .send({
    //                     id: crypto.randomUUID(),
    //                     label: 'Label',
    //                     emoji: '😀',
    //                     balance: '100',
    //                     groupId: dummyGroup.getId(),
    //                     memberId: NOT_EXISTING_ID,
    //                 });

    //             expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //         });
    //     });

    //     describe('both group and group member exist', () => {
    //         const dummyGroup = generateDefaultUserRandomGroup();
    //         const dummyMember = getAnyMemberFrom(dummyGroup);

    //         beforeEach(async () => {
    //             const users = mapUsersFrom(dummyGroup.getMembers());
    //             await userRepo.empty();
    //             await userRepo.insert(...users);

    //             await groupRepo.empty();
    //             await groupRepo.save(dummyGroup);
    //         });

    //         it('should save a group expense in database', async () => {
    //             const expenseId = crypto.randomUUID();
    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/group`)
    //                 .send({
    //                     id: expenseId,
    //                     label: 'Label',
    //                     emoji: '😀',
    //                     balance: '100',
    //                     groupId: dummyGroup.getId(),
    //                     memberId: dummyMember.getId(),
    //                 });

    //             expect(response.status).toBe(HttpStatus.CREATED);
    //             expect(await expenseRepo.expenseSaved(expenseId));
    //         });

    //         function getAnyMemberFrom(group: Group): Member {
    //             const members = group.getMembers();
    //             const index = Math.floor(Math.random() * members.length);
    //             return members[index];
    //         }
    //     });
    // });

    // describe('POST /expenses/pair', () => {
    //     const invalidPayloads: NonNullable<unknown>[] = [
    //         '',
    //         {},
    //         { id: 'not-a-uuid' },
    //         { id: crypto.randomUUID() },
    //         { id: crypto.randomUUID(), label: '' },
    //         { id: crypto.randomUUID(), label: 'Label', emoji: 'not-an-emoji' },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: 'not-a-number',
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             isCurrentPayer: 'not-a-boolean',
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             isCurrentPayer: true,
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: '100',
    //             isCurrentPayer: true,
    //             userId: 'not-a-uuid',
    //         },
    //         {
    //             id: crypto.randomUUID(),
    //             label: 'Label',
    //             emoji: '😀',
    //             balance: 'not-a-number',
    //             isCurrentPayer: true,
    //             userId: crypto.randomUUID(),
    //         },
    //     ];

    //     it.each(invalidPayloads)(
    //         'should return 400 BAD_REQUEST when given payload "%s" is invalid',
    //         async (payload: NonNullable<unknown>) => {
    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/pair`)
    //                 .send(payload);

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     describe('expense user exists', () => {
    //         const dummyUser = generateRandomUser();

    //         beforeEach(async () => {
    //             await userRepo.empty();
    //             await userRepo.insert(dummyUser);
    //         });

    //         it('should insert a pair expense in database', async () => {
    //             const expenseId = crypto.randomUUID();
    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/pair`)
    //                 .send({
    //                     id: expenseId,
    //                     label: 'Label',
    //                     emoji: '📦',
    //                     balance: '14,75',
    //                     isCurrentPayer: true,
    //                     userId: dummyUser.getId(),
    //                 });

    //             expect(response.status).toBe(HttpStatus.CREATED);
    //             expect(await expenseRepo.expenseSaved(expenseId)).toBe(true);
    //         });
    //     });

    //     describe('expense user does not exist', () => {
    //         beforeEach(async () => {
    //             await userRepo.empty();
    //         });

    //         it('should return 404 NOT_FOUND', async () => {
    //             const NOT_EXISTING_ID = crypto.randomUUID();

    //             const response = await request(httpServer)
    //                 .post(`/${EXPENSES_API_ROUTE}/pair`)
    //                 .send({
    //                     id: crypto.randomUUID(),
    //                     label: 'Label',
    //                     emoji: '📦',
    //                     balance: '14,75',
    //                     isCurrentPayer: true,
    //                     userId: NOT_EXISTING_ID,
    //                 });

    //             expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //         });
    //     });
    // });

    // describe('PUT /expenses/group/:groupId/:expenseId', () => {
    //     const invalidIds = ['id', 59391, NaN, ['id']];

    //     const invalidDebtorIds = ['id', null, 59391, NaN, undefined, ['id']];
    //     const dummyDebtorIds = [crypto.randomUUID(), crypto.randomUUID()];

    //     it.each(invalidIds)(
    //         'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
    //         async (id: unknown) => {
    //             const response = await request(httpServer)
    //                 .put(`/${EXPENSES_API_ROUTE}/group/${id}/${id}`)
    //                 .send({ debtorIds: dummyDebtorIds });

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     it.each(invalidDebtorIds)(
    //         'should return 400 BAD_REQUEST when given debtor ids "%s" are not valid uuids',
    //         async (debtorIds: unknown) => {
    //             const dummyGroupId = crypto.randomUUID();
    //             const dummyExpenseId = crypto.randomUUID();

    //             const response = await request(httpServer)
    //                 .put(
    //                     `/${EXPENSES_API_ROUTE}/group/${dummyGroupId}/${dummyExpenseId}`,
    //                 )
    //                 .send({ debtorIds });

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     describe('actor expense does not exist', () => {
    //         beforeEach(async () => {
    //             await expenseRepo.empty();
    //         });

    //         it('should return 404 NOT_FOUND', async () => {
    //             const [NOT_EXISTING_ID_1, NOT_EXISTING_ID_2] = [
    //                 crypto.randomUUID(),
    //                 crypto.randomUUID(),
    //             ];

    //             const response = await request(httpServer)
    //                 .put(
    //                     `/${EXPENSES_API_ROUTE}/group/${NOT_EXISTING_ID_1}/${NOT_EXISTING_ID_2}`,
    //                 )
    //                 .send({ debtorIds: dummyDebtorIds });

    //             expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //         });
    //     });

    //     describe('actor expense exists', () => {
    //         const dummyGroup = generateDefaultUserRandomGroup();

    //         describe('actor is creditor', () => {
    //             describe('actor settles all debtors share', () => {
    //                 const dummyExpense =
    //                     createRandomCreditExpenseFor(dummyGroup);
    //                 const groupId = dummyGroup.getId();
    //                 const expenseId = dummyExpense.getId();

    //                 beforeEach(async () => {
    //                     await expenseRepo.empty();
    //                     await expenseRepo.insert(dummyExpense);
    //                 });

    //                 const debtorIds = dummyExpense
    //                     .getCounterpartiesOf(actorId)
    //                     .map((counterparty) => counterparty.getId());

    //                 it('should have settled all expense counterparties', async () => {
    //                     await request(httpServer)
    //                         .put(
    //                             `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
    //                         )
    //                         .send({ debtorIds });

    //                     const updatedExpense = await expenseRepo.get(expenseId);
    //                     expectDebtorsShareToHaveBeenSettledIn(
    //                         updatedExpense,
    //                         debtorIds,
    //                     );
    //                 });

    //                 it('should not retrieve fully settled expense', async () => {
    //                     await request(httpServer)
    //                         .put(
    //                             `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
    //                         )
    //                         .send({ debtorIds });

    //                     const response = await request(httpServer).get(
    //                         `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //                     );

    //                     expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //                 });
    //             });

    //             describe('actor settles not all debtors share', () => {
    //                 const dummyExpense =
    //                     createRandomCreditExpenseFor(dummyGroup);
    //                 const groupId = dummyGroup.getId();
    //                 const expenseId = dummyExpense.getId();

    //                 beforeEach(async () => {
    //                     await expenseRepo.empty();
    //                     await expenseRepo.insert(dummyExpense);
    //                 });

    //                 const debtorIds = [
    //                     dummyExpense
    //                         .getCounterpartiesOf(actorId)
    //                         .map((counterparty) => counterparty.getId())[0],
    //                 ];

    //                 it('should have settled all expense counterparties', async () => {
    //                     await request(httpServer)
    //                         .put(
    //                             `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
    //                         )
    //                         .send({ debtorIds });

    //                     const updatedExpense = await expenseRepo.get(expenseId);
    //                     expectDebtorsShareToHaveBeenSettledIn(
    //                         updatedExpense,
    //                         debtorIds,
    //                     );
    //                 });

    //                 it('should return not fully settled expense', async () => {
    //                     await request(httpServer)
    //                         .put(
    //                             `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
    //                         )
    //                         .send({ debtorIds });

    //                     const response = await request(httpServer).get(
    //                         `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //                     );

    //                     expect(response.status).not.toBe(HttpStatus.NOT_FOUND);
    //                 });
    //             });

    //             function expectDebtorsShareToHaveBeenSettledIn(
    //                 expense: Expense,
    //                 debtorIds: Array<string>,
    //             ): void {
    //                 debtorIds.forEach((debtorId) =>
    //                     expect(expense.getShareOf(debtorId)).toBe(0),
    //                 );
    //             }
    //         });

    //         describe('actor is debtor and settles their own share', () => {
    //             const dummyExpense = createRandomDebitExpenseFor(dummyGroup);

    //             it("should have settled expense actor's share", async () => {
    //                 await expenseRepo.empty();
    //                 await expenseRepo.insert(dummyExpense);

    //                 const groupId = dummyGroup.getId();
    //                 const expenseId = dummyExpense.getId();

    //                 await request(httpServer)
    //                     .put(
    //                         `/${EXPENSES_API_ROUTE}/group/${groupId}/${expenseId}`,
    //                     )
    //                     .send({ debtorIds: [] });

    //                 const updatedExpense = await expenseRepo.get(expenseId);
    //                 expect(updatedExpense.getShareOf(actorId)).toBe(0);
    //             });
    //         });
    //     });
    // });

    // describe('PUT /expenses/pair/:contactId/:expenseId', () => {
    //     const invalidIds = ['id', null, 59391, NaN, undefined];

    //     it.each(invalidIds)(
    //         'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
    //         async (id: unknown) => {
    //             const response = await request(httpServer).put(
    //                 `/${EXPENSES_API_ROUTE}/pair/${id}/${id}`,
    //             );

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     describe('actor expense does not exist', () => {
    //         beforeEach(async () => {
    //             await expenseRepo.empty();
    //         });

    //         it('should return 404 NOT_FOUND', async () => {
    //             const [NOT_EXISTING_ID_1, NOT_EXISTING_ID_2] = [
    //                 crypto.randomUUID(),
    //                 crypto.randomUUID(),
    //             ];

    //             const response = await request(httpServer).put(
    //                 `/${EXPENSES_API_ROUTE}/${NOT_EXISTING_ID_1}/${NOT_EXISTING_ID_2}`,
    //             );

    //             expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //         });
    //     });

    //     describe('actor expense exists', () => {
    //         const dummyExpense = generateDefaultUserPairExpense();

    //         beforeEach(async () => {
    //             await expenseRepo.empty();
    //             await expenseRepo.insert(dummyExpense);
    //         });

    //         it('should have settled the right expense', async () => {
    //             const expenseId = dummyExpense.getId();

    //             const [counterparty] =
    //                 dummyExpense.getCounterpartiesOf(actorId);
    //             const contactId = counterparty.getId();

    //             await request(httpServer).put(
    //                 `/${EXPENSES_API_ROUTE}/pair/${contactId}/${expenseId}`,
    //             );

    //             const updatedExpense = await expenseRepo.get(expenseId);
    //             const debtorId = getDummyExpenseDebtorId();

    //             expect(updatedExpense.getShareOf(debtorId)).toBe(0);
    //         });

    //         function getDummyExpenseDebtorId(): string {
    //             if (dummyExpense.hasCreditor(actorId)) {
    //                 const [counterparty] =
    //                     dummyExpense.getCounterpartiesOf(actorId);

    //                 return counterparty.getId();
    //             }
    //             return actorId;
    //         }
    //     });
    // });

    function createRandomDebitExpenseFor(group: Group): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance: generateRandomBalance(),
            creditor: generateRandomMember(),
        };
        return GroupExpense.create(metadata, group, payment);
    }

    function createRandomCreditExpenseFor(group: Group): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance: generateRandomBalance(),
            creditor: Member.fromUser(DEFAULT_USER),
        };
        return GroupExpense.create(metadata, group, payment);
    }
});
