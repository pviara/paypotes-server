import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactModule } from '@contacts/contact.module';
import { CONTACTS_API_ROUTE } from '@contacts/presentation/contact.controller';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseModule } from '@expenses/expense.module';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { GroupModule } from '@groups/group.module';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { initMessagingApplicationWith } from '@test/helpers/application/utils';
import { setTimeout } from 'node:timers/promises';
import { shutdown } from '@test/helpers/utils';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import * as request from 'supertest';
import { ContactWithBalanceDTO } from '@contacts/presentation/dto/contact-with-balance.dto';

describe("Caleb's use case", () => {
    const application = initMessagingApplicationWith([
        ContactModule,
        ExpenseModule,
        GroupModule,
        UserModule,
    ]);

    let httpServer: App;

    const users = {
        Actor: {
            profile: DEFAULT_USER,
        },
        Michael: {
            profile: new User({
                id: crypto.randomUUID(),
                firstname: 'Michael',
                lastname: 'Chains',
                avatarUrl: '',
                email: 'michael.chains@usecase.com',
            }),
            pairExpenseId: crypto.randomUUID(),
            balanceForPairExpense: 28,
        },
        Serena: {
            profile: new User({
                id: crypto.randomUUID(),
                firstname: 'Serena',
                lastname: 'Philips',
                avatarUrl: '',
                email: 'serena.philips@usecase.com',
            }),
            pairExpenseId: crypto.randomUUID(),
            balanceForPairExpense: 36,
            balanceForGroupExpense: 102,
        },
    };

    const groupId = crypto.randomUUID();
    const groupExpenseId = crypto.randomUUID();

    beforeAll(async () => {
        await application.bootstrap();
        await application.emptyDatabase();

        httpServer = application.getHttpServer();

        await setupUsers();
        await makeActorAddDebitPairExpenseWithMichael();
        await makeActorAddDebitPairExpenseWithSerena();

        await makeActorCreateGroup();
        await makeActorAddDebitGroupExpenseForSerena();

        await waitForAllContactsToBeAdded();
    });

    afterAll(shutdown(application));

    describe('Caleb checks on his contact list', () => {
        it('should display both Michael and Serena', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );
            expect(response.body.length).toBe(2);
        });

        it('should display the right balances for both contacts', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );

            const dtos = response.body;
            expectBothContactsToHaveTheRightBalanceIn(dtos);
        });

        function expectBothContactsToHaveTheRightBalanceIn(
            dtos: Array<ContactWithBalanceDTO>,
        ): void {
            const [michael, serena] = dtos;
            expect(michael.balance).toBe('-14,00');
            expect(serena.balance).toBe('-52,00');
        }
    });

    async function setupUsers(): Promise<void> {
        const { userRepo } = application.getRepositories();
        await userRepo.insert(
            ...Object.values(users).map((user) => user.profile),
        );
    }

    async function makeActorAddDebitPairExpenseWithMichael(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/pair`)
            .send({
                id: users.Michael.pairExpenseId,
                label: 'Concert ticket',
                emoji: '🎫',
                balance: users.Michael.balanceForPairExpense
                    .toFixed(2)
                    .replace('.', ','),
                isCurrentPayer: false,
                userId: users.Michael.profile.getId(),
            });
    }

    async function makeActorAddDebitPairExpenseWithSerena(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/pair`)
            .send({
                id: users.Serena.pairExpenseId,
                label: 'Concert ticket',
                emoji: '🎫',
                balance: users.Serena.balanceForPairExpense
                    .toFixed(2)
                    .replace('.', ','),
                isCurrentPayer: false,
                userId: users.Serena.profile.getId(),
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

    async function makeActorAddDebitGroupExpenseForSerena(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/group`)
            .send({
                id: groupExpenseId,
                label: 'Pop-corn',
                emoji: '🍿',
                balance: users.Serena.balanceForGroupExpense
                    .toFixed(2)
                    .replace('.', ','),
                isCurrentPayer: false,
                groupId: groupId,
                memberId: users.Serena.profile.getId(),
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
