import { App } from 'supertest/types';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import {
    contactTasksSpecModules as modules,
    contactTasksSpecProviders as providers,
} from '@test/helpers/contact/tasks/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { generateRandomUser } from '@test/helpers/user/utils';
import { initMessagingRunnerWith } from '@test/helpers/application-runner/utils';
import { setTimeout } from 'node:timers/promises';
import { shutdown } from '@test/helpers/utils';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import * as request from 'supertest';

describe('contact application tasks', () => {
    const runner = initMessagingRunnerWith(modules, providers);

    let contactRepo: ContactRepository;
    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await runner.bootstrap();

        contactRepo = runner.getRepository('contact');
        userRepo = runner.getRepository('user');
        httpServer = runner.getHttpServer();
    });

    afterEach(shutdown(runner));

    it('should add a relationship between pair expense users', async () => {
        const dummyUser = generateRandomUser();
        await userRepo.empty();
        await userRepo.insert(DEFAULT_USER, dummyUser);

        const expenseId = crypto.randomUUID();
        await request(httpServer).post(`/${EXPENSES_API_ROUTE}/pair`).send({
            id: expenseId,
            label: 'Label',
            emoji: '📦',
            balance: '14,75',
            isCurrentPayer: true,
            userId: dummyUser.getId(),
        });

        await setTimeout(100);

        const createdContact = await contactRepo.getActorContactById(
            DEFAULT_USER.getId(),
            dummyUser.getId(),
        );
        expect(createdContact?.getId()).toBe(dummyUser.getId());
    });
});
