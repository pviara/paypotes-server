import { App } from 'supertest/types';
import { empty, shutdown } from '@test/helpers/utils';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '../expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import * as request from 'supertest';

describe('getActorGroupExpenseById', () => {
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

    // todo 😎
    describe('given ids are invalid', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
            async (id: unknown) => {
                const dummyExpense =
                    await fixture.setupDefaultUserGroupExpense();

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${id}/expense/${dummyExpense.getId()}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
            async (id: unknown) => {
                const dummyGroup = await fixture.setupDefaultUserGroup();

                const response = await request(httpServer).get(
                    `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    // describe('GET /expenses/group/:groupId/expense/:expenseId', () => {
    //     const invalidIds = ['id', null, 59391, NaN, undefined];

    //     it.each(invalidIds)(
    //         'should return 400 BAD_REQUEST when given groupId "%s" is not a valid uuid',
    //         async (groupId: unknown) => {
    //             const validId = crypto.randomUUID();
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}/group/${groupId}/expense/${validId}`,
    //             );

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     it.each(invalidIds)(
    //         'should return 400 BAD_REQUEST when given expenseId "%s" is not a valid uuid',
    //         async (expenseId: unknown) => {
    //             const validId = crypto.randomUUID();
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}/group/${validId}/expense/${expenseId}`,
    //             );

    //             expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    //         },
    //     );

    //     it('should return the right expense for given groupId and expenseId', async () => {
    //         const dummyGroup = generateDefaultUserRandomGroup();
    //         const dummyExpense = generateDefaultUserGroupExpense(dummyGroup);
    //         await expenseRepo.insert(dummyExpense);

    //         const response = await request(httpServer).get(
    //             `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //         );

    //         expect(response.body.id).toBe(dummyExpense.getId());
    //         expect(response.body.label).toBe(dummyExpense.getLabel());
    //         expect(response.body.emoji).toBe(dummyExpense.getEmoji());
    //         expect(response.body.createdAt).toBeDefined();
    //         expect(response.body.payment.balance).toBe(
    //             BalanceDTO.from(dummyExpense.getPayment().balance).getValue(),
    //         );
    //     });

    //     describe('expense is settled', () => {
    //         const dummyGroup = generateDefaultUserRandomGroup();

    //         describe('actor is creditor', () => {
    //             const dummyExpense = createRandomCreditExpenseFor(dummyGroup);

    //             it('should return 404 NOT_FOUND', async () => {
    //                 await expenseRepo.insert(dummyExpense);
    //                 await paybackGroupExpense(dummyExpense);

    //                 const response = await request(httpServer).get(
    //                     `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //                 );

    //                 expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //             });
    //         });

    //         describe('actor is debtor', () => {
    //             const dummyExpense = createRandomDebitExpenseFor(dummyGroup);

    //             it('should return 404 NOT_FOUND', async () => {
    //                 await expenseRepo.insert(dummyExpense);
    //                 await paybackGroupExpense(dummyExpense);

    //                 const response = await request(httpServer).get(
    //                     `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //                 );

    //                 expect(response.status).toBe(HttpStatus.NOT_FOUND);
    //             });
    //         });
    //     });

    //     describe('actor is the expense creditor', () => {
    //         const dummyBalance = 1000;
    //         const dummyGroup = generateDefaultUserRandomGroup();
    //         const dummyExpense = generateGroupExpenseAsCreditor();

    //         beforeEach(async () => {
    //             await expenseRepo.empty();
    //             await expenseRepo.insert(dummyExpense);
    //         });

    //         it("should return an expense that exposes the right actor's share", async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //             );

    //             const members = dummyGroup.getMembers().length;
    //             const creditedMembers = members - 1;
    //             const balance = (dummyBalance / members) * creditedMembers;

    //             const expected = `${convertCents(balance).toFixed(2)}`.replace(
    //                 '.',
    //                 ',',
    //             );
    //             expect(response.body.balance).toBe(expected);
    //         });

    //         it('should return an expense with stakeholders and their share', async () => {
    //             const response = await request(httpServer).get(
    //                 `/${EXPENSES_API_ROUTE}/group/${dummyGroup.getId()}/expense/${dummyExpense.getId()}`,
    //             );

    //             const expectedStakeholders = mapDummyExpenseStakeholderDTOs();
    //             expect(response.body.stakeholders).toStrictEqual(
    //                 expectedStakeholders,
    //             );
    //         });

    //         function generateGroupExpenseAsCreditor(): GroupExpense {
    //             const dummyMetadata = generateRandomMetadata();
    //             const dummyPayment: GroupPayment = {
    //                 balance: dummyBalance,
    //                 creditor: Member.fromUser(DEFAULT_USER),
    //             };

    //             return GroupExpense.create(
    //                 dummyMetadata,
    //                 dummyGroup,
    //                 dummyPayment,
    //             );
    //         }

    //         function mapDummyExpenseStakeholderDTOs(): unknown {
    //             return dummyExpense
    //                 .getStakeholders()
    //                 .map((stakeholder) =>
    //                     raw(StakeholderDTO.from(stakeholder)),
    //                 );
    //         }
    //     });
    // });
});
