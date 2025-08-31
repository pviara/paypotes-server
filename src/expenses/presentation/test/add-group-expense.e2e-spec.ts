import { App } from 'supertest/types';
import { empty, shutdown } from '@test/helpers/utils';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseSpecModules as modules } from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { Group } from '@groups/domain/group';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { Member } from '@groups/domain/member';
import * as request from 'supertest';

describe('addGroupExpense', () => {
    const application = initApplicationWith(modules);

    let fixture: Fixture;
    let httpServer: App;
    let expenseRepo: ExpensePostgresTestingRepository;

    beforeAll(async () => {
        await application.bootstrap();

        fixture = Fixture.create(application);

        httpServer = application.getHttpServer();
        ({ expenseRepo } = application.getRepositories());
    });

    afterAll(shutdown(application));

    beforeEach(empty(application));

    afterEach(empty(application));

    describe('given payload is invalid', () => {
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
                    .post(`/${EXPENSES_API_ROUTE}/group`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
    });

    describe('expense group does not exist', () => {
        it('should return 404 NOT_FOUND', async () => {
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer)
                .post(`/${EXPENSES_API_ROUTE}/group`)
                .send({
                    id: crypto.randomUUID(),
                    label: 'Label',
                    emoji: '📦',
                    balance: '14,75',
                    isCurrentPayer: true,
                    groupId: NOT_EXISTING_ID,
                    memberId: NOT_EXISTING_ID,
                });

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('expense group member does not exist', () => {
        it('should return 404 NOT_FOUND', async () => {
            const dummyGroup = await fixture.setupDefaultUserGroup();
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer)
                .post(`/${EXPENSES_API_ROUTE}/group`)
                .send({
                    id: crypto.randomUUID(),
                    label: 'Label',
                    emoji: '📦',
                    balance: '14,75',
                    isCurrentPayer: true,
                    groupId: dummyGroup.getId(),
                    memberId: NOT_EXISTING_ID,
                });

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('both expense group and member exist', () => {
        it('should insert a pair expense in database', async () => {
            const dummyGroup = await fixture.setupDefaultUserGroup();
            const randomDummyMember = pickRandomMemberFrom(dummyGroup);
            const dummyExpenseId = crypto.randomUUID();

            const response = await request(httpServer)
                .post(`/${EXPENSES_API_ROUTE}/group`)
                .send({
                    id: dummyExpenseId,
                    label: 'Label',
                    emoji: '📦',
                    balance: '14,75',
                    isCurrentPayer: true,
                    groupId: dummyGroup.getId(),
                    memberId: randomDummyMember.getId(),
                });

            expect(response.status).toBe(HttpStatus.CREATED);

            const expenseSaved = await expenseRepo.expenseSaved(dummyExpenseId);
            expect(expenseSaved).toBe(true);
        });

        function pickRandomMemberFrom(dummyGroup: Group): Member {
            const members = dummyGroup.getMembers();
            return members[Math.floor(Math.random() * members.length)];
        }
    });
});
