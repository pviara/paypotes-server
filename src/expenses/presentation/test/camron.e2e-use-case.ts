import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactModule } from '@contacts/contact.module';
import { CreateGroupDTO } from '@groups/presentation/dto/create-group.dto';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseDTO } from '@expenses/presentation/dto/expense.dto';
import { ExpenseModule } from '@expenses/expense.module';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { generateRandomUser } from '@test/helpers/user/utils';
import { GroupModule } from '@groups/group.module';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { initMessagingApplicationWith } from '@test/helpers/application/utils';
import { setTimeout } from 'node:timers/promises';
import { shutdown } from '@test/helpers/utils';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import * as request from 'supertest';

// [DOC] https://github.com/pviara/paypotes-server/issues/111
describe("Camron's use case", () => {
    const application = initMessagingApplicationWith([
        ContactModule,
        ExpenseModule,
        GroupModule,
        UserModule,
    ]);

    let httpServer: App;

    const users = {
        Camron: {
            profile: DEFAULT_USER,
            balanceForGroupExpense: 126,
        },
        Stanford: {
            profile: new User({
                id: crypto.randomUUID(),
                firstname: 'Stanford',
                lastname: 'Gill',
                avatarUrl: '',
                email: 'stanford.gill@usecase.com',
            }),
            pairExpenseId: crypto.randomUUID(),
            balanceForPairExpense: 24,
        },
        Unknown: {
            profile: generateRandomUser(),
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

        await makeActorCreateGroup();
        await makeActorAddDebitGroupExpenseForCamron();

        await waitForAllContactsToBeAdded();

        const fixture = Fixture.create(application);
        await fixture.setupRandomGroupExpenses();
        await fixture.setupRandomPairExpenses();
    });

    afterAll(shutdown(application));

    describe("Camron checks on Stanford's contact detail", () => {
        it('shoud display both expenses', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${users.Stanford.profile.getId()}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(2);
            expectBothExpensesToHaveBeenReturnedIn(dtos);
        });

        it('should display the right balance for both expenses', async () => {
            const response = await request(httpServer).get(
                `/${EXPENSES_API_ROUTE}/contact/${users.Stanford.profile.getId()}`,
            );

            const [groupExpense, pairExpense] = response.body;
            expect(groupExpense.balance).toBe('42,00');
            expect(pairExpense.balance).toBe('12,00');
        });

        function expectBothExpensesToHaveBeenReturnedIn(
            dtos: Array<ExpenseDTO>,
        ): void {
            const bothExpensesHaveBeenReturned = dtos.every(
                (dto) =>
                    dto.id === users.Stanford.pairExpenseId ||
                    dto.id === groupExpenseId,
            );
            expect(bothExpensesHaveBeenReturned).toBe(true);
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
                id: users.Stanford.pairExpenseId,
                label: 'Burgers',
                emoji: '🍔',
                balance: users.Stanford.balanceForPairExpense
                    .toFixed(2)
                    .replace('.', ','),
                isCurrentPayer: true,
                userId: users.Stanford.profile.getId(),
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

    async function makeActorAddDebitGroupExpenseForCamron(): Promise<void> {
        await request(httpServer)
            .post(`/${EXPENSES_API_ROUTE}/group`)
            .send({
                id: groupExpenseId,
                label: 'Pop-corn',
                emoji: '🍿',
                balance: users.Camron.balanceForGroupExpense
                    .toFixed(2)
                    .replace('.', ','),
                groupId: groupId,
                memberId: users.Camron.profile.getId(),
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
