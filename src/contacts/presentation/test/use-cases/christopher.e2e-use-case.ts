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
        Christopher: {
            profile: DEFAULT_USER,
        },
        Holy: {
            profile: new User({
                id: crypto.randomUUID(),
                firstname: 'Holy',
                lastname: 'Reed',
                avatarUrl: '',
                email: 'holy.reed@usecase.com',
            }),
            groupExpenseId: crypto.randomUUID(),
            pairExpenseId: crypto.randomUUID(),
            balanceForGroupExpense: 66,
            balanceForPairExpense: 32,
        },
        Tony: {
            profile: generateRandomUser(),
            balanceForGroupExpense: 30,
        },
    };

    const groupId = crypto.randomUUID();

    beforeAll(async () => {
        await application.bootstrap();
        await application.emptyDatabase();

        httpServer = application.getHttpServer();

        await setupUsers();
        await makeActorAddCreditPairExpenseWithHoly();

        await makeActorCreateGroup();
        await makeActorAddDebitGroupExpenseForHoly();
        await makeActorAddCreditPairExpenseForUnknown();

        await waitForAllContactsToBeAdded();
    });

    afterAll(shutdown(application));

    // [DOC] https://github.com/pviara/paypot-server/issues/108
    describe("Christopher checks on Holy's contact detail", () => {
        it('should display a balance of "-6,00"', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}/${users.Holy.profile.getId()}`,
            );
            expect(response.body.balance).toBe('-6,00');
        });

        it('shoud display both expenses', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${users.Holy.profile.getId()}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(2);
            expectBothExpensesToHaveBeenReturnedIn(dtos);
        });

        function expectBothExpensesToHaveBeenReturnedIn(
            dtos: Array<ExpenseDTO>,
        ): void {
            const bothExpensesHaveBeenReturned = dtos.every(
                (dto) =>
                    dto.id === users.Holy.pairExpenseId ||
                    dto.id === users.Holy.groupExpenseId,
            );
            expect(bothExpensesHaveBeenReturned).toBe(true);
        }
    });

    // [DOC] https://github.com/pviara/paypot-server/issues/114
    describe.only("Christopher checks on Tony's contact detail", () => {
        it('should display a balance of "-6,00"', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}/${users.Tony.profile.getId()}`,
            );
            expect(response.body.balance).toBe('112,50');
        });

        it('shoud display only expense shared with Tony', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${users.Tony.profile.getId()}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(1);
        });
    });

    async function setupUsers(): Promise<void> {
        const { userRepo } = application.getRepositories();
        await userRepo.insert(
            ...Object.values(users).map((user) => user.profile),
        );
    }

    async function makeActorAddCreditPairExpenseWithHoly(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/pair`)
            .send({
                id: users.Holy.pairExpenseId,
                label: 'Concert ticket',
                emoji: '🎫',
                balance: users.Holy.balanceForPairExpense
                    .toFixed(2)
                    .replace('.', ','),
                isCurrentPayer: true,
                userId: users.Holy.profile.getId(),
            });
    }

    async function makeActorAddCreditPairExpenseForUnknown(): Promise<void> {
        await request(httpServer).post(`/${EXPENSES_API_ROUTE}/pair`).send({
            id: crypto.randomUUID(),
            label: 'Plane',
            emoji: '✈️',
            balance: '225,00',
            isCurrentPayer: true,
            userId: users.Tony.profile.getId(),
        });
    }

    async function makeActorCreateGroup(): Promise<void> {
        const payload: CreateGroupDTO = {
            id: groupId,
            name: 'Cinema',
            emoji: '🎞️',
            userIds: Object.values(users).map((user) => user.profile.getId()),
        };
        await request(httpServer).post(`/${GROUPS_API_ROUTE}`).send(payload);
    }

    async function makeActorAddDebitGroupExpenseForHoly(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/group`)
            .send({
                id: users.Holy.groupExpenseId,
                label: 'Pop-corn',
                emoji: '🍿',
                balance: users.Holy.balanceForGroupExpense
                    .toFixed(2)
                    .replace('.', ','),
                groupId: groupId,
                memberId: users.Holy.profile.getId(),
            });
    }

    async function waitForAllContactsToBeAdded(): Promise<void> {
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
