import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactModule } from '@contacts/contact.module';
import { CONTACTS_API_ROUTE } from '@contacts/presentation/contact.controller';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseDTO } from '@expenses/presentation/dto/expense.dto';
import { ExpenseModule } from '@expenses/expense.module';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { generateRandomUser } from '@test/helpers/user/utils';
import { GroupModule } from '@groups/group.module';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { initMessagingApplicationWith } from '@test/helpers/application/utils';
import { setTimeout } from 'node:timers/promises';
import { shutdown } from '@test/helpers/utils';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import * as request from 'supertest';

describe("Christopher's use case", () => {
    const application = initMessagingApplicationWith([
        ContactModule,
        ExpenseModule,
        GroupModule,
        UserModule,
    ]);

    let httpServer: App;

    const users = {
        Actor: DEFAULT_USER,
        Holy: new User({
            id: crypto.randomUUID(),
            firstname: 'Holy',
            lastname: 'Reed',
            avatarUrl: '',
            email: 'holy.reed@usecase.com',
        }),
        Unknown: generateRandomUser(),
    };

    const groupId = crypto.randomUUID();
    const pairExpenseId = crypto.randomUUID();
    const groupExpenseId = crypto.randomUUID();

    const balances = { forPairExpense: 32, forGroupExpense: 66 };

    beforeAll(async () => {
        await application.bootstrap();
        await application.emptyDatabase();

        httpServer = application.getHttpServer();

        await setupUsers();
        await makeActorAddCreditPairExpenseWithHoly();

        await makeActorCreateGroup();
        await makeActorAddDebitGroupExpenseForHoly();
        await makeActorAddCreditPairExpenseForUnknown();

        await waitForAnyContactToBeAdded();
    });

    afterAll(shutdown(application));

    describe("Christopher checks on Holy's contact detail", () => {
        it('should display a balance of "-6,00"', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}/${users.Holy.getId()}`,
            );
            expect(response.body.balance).toBe('-6,00');
        });

        it('shoud display both expenses', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${users.Holy.getId()}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(2);
            expectBothExpensesToHaveBeenReturnedIn(dtos);
        });

        function expectBothExpensesToHaveBeenReturnedIn(
            dtos: Array<ExpenseDTO>,
        ): void {
            const bothExpensesHaveBeenReturned = dtos.every(
                (dto) => dto.id === pairExpenseId || dto.id === groupExpenseId,
            );
            expect(bothExpensesHaveBeenReturned).toBe(true);
        }
    });

    async function setupUsers(): Promise<void> {
        const { userRepo } = application.getRepositories();
        await userRepo.insert(...Object.values(users));
    }

    async function makeActorAddCreditPairExpenseWithHoly(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/pair`)
            .send({
                id: pairExpenseId,
                label: 'Concert ticket',
                emoji: '🎫',
                balance: balances.forPairExpense.toFixed(2).replace('.', ','),
                isCurrentPayer: true,
                userId: users.Holy.getId(),
            });
    }

    async function makeActorAddCreditPairExpenseForUnknown(): Promise<void> {
        await request(httpServer).post(`/${EXPENSES_API_ROUTE}/pair`).send({
            id: crypto.randomUUID(),
            label: 'Plane',
            emoji: '✈️',
            balance: '225,00',
            isCurrentPayer: true,
            userId: users.Unknown.getId(),
        });
    }

    async function makeActorCreateGroup(): Promise<void> {
        const payload: CreateGroupDTO = {
            id: groupId,
            name: 'Cinema',
            emoji: '🎞️',
            userIds: Object.values(users).map((user) => user.getId()),
        };
        await request(httpServer).post(`/${GROUPS_API_ROUTE}`).send(payload);
    }

    async function makeActorAddDebitGroupExpenseForHoly(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/group`)
            .send({
                id: groupExpenseId,
                label: 'Pop-corn',
                emoji: '🍿',
                balance: balances.forGroupExpense.toFixed(2).replace('.', ','),
                isCurrentPayer: false,
                groupId: groupId,
                memberId: users.Holy.getId(),
            });
    }

    async function waitForAnyContactToBeAdded(): Promise<void> {
        const startTime = Date.now();
        const POLLING_TIMEOUT_MS = 4000;
        const POLLING_INTERVAL_MS = 500;

        while (Date.now() - startTime < POLLING_TIMEOUT_MS) {
            const contacts = await getDefaultUserContacts();
            if (contacts.length > 1) {
                return;
            }
            await setTimeout(POLLING_INTERVAL_MS);
        }

        throw new Error(
            `Test failed: condition not met within ${POLLING_TIMEOUT_MS} milliseconds`,
        );
    }

    function getDefaultUserContacts(): Promise<Contact[]> {
        const { contactRepo } = application.getRepositories();
        const NO_PAGE_INDEX = 0;
        const NO_SEARCH = '';

        return contactRepo.getActorContacts(
            DEFAULT_USER.getId(),
            NO_PAGE_INDEX,
            NO_SEARCH,
        );
    }
});
