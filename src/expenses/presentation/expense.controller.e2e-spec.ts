import { App } from 'supertest/types';
import { Expense } from '@expenses/domain/expense';
import {
    expenseSpecModules as modules,
    expenseSpecProviders as providers,
} from '@test/helpers/expense/utils';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { Relationship } from '@expenses/persistence/relationship';
import { shutdown } from '@test/helpers/utils';
import * as request from 'supertest';

describe('ExpenseController', () => {
    const runner = initRunnerWith(modules, providers);

    let httpServer: App;

    beforeAll(async () => {
        await runner.bootstrap();
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
            let dummyExpenses: Array<Expense>;
            let dummyRelationships: Array<Relationship>;

            beforeEach(() => {
                dummyExpenses = generateDummyExpenses({ length: 40 });
                dummyRelationships = generateDefaultUserRelationships({
                    expenses: dummyExpenses,
                });
            });
        });
    });
});
