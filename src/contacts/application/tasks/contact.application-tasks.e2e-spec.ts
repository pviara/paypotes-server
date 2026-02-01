import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactDatabaseTestingRepository } from '@test/helpers/contact/contact.database-testing-repository';
import { contactTasksSpecModules as modules } from '@test/helpers/contact/tasks/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { generateRandomUser } from '@test/helpers/user/utils';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { initMessagingApplicationWith } from '@test/helpers/application/utils';
import { empty, mapIdsFrom, shutdown } from '@test/helpers/utils';
import { setTimeout } from 'node:timers/promises';
import { User } from '@users/domain/user';
import { UserDatabaseTestingRepository } from '@test/helpers/user/user.database-testing-repository';
import * as request from 'supertest';

describe('contact application tasks', () => {
    const application = initMessagingApplicationWith(modules);

    let contactRepo: ContactDatabaseTestingRepository;
    let userRepo: UserDatabaseTestingRepository;
    let httpServer: App;

    const NO_PAGE_INDEX = 0;
    const NO_SEARCH = '';

    const dummyGroupMembers = [
        DEFAULT_USER,
        generateRandomUser(),
        generateRandomUser(),
    ];

    const groupId = crypto.randomUUID();
    const userIds = mapIdsFrom(dummyGroupMembers);

    beforeAll(async () => {
        await application.bootstrap();

        httpServer = application.getHttpServer();
        ({ contactRepo, userRepo } = application.getRepositories());
    });

    afterAll(shutdown(application));

    beforeEach(empty(application));

    afterEach(empty(application));

    it('should add a relationship between pair expense users', async () => {
        const dummyUser = generateRandomUser();
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

        const makeAssertion = (contacts: Array<Contact>): void => {
            expect(contacts.length).toBe(1);
            expectUserToHaveBeenAddedIn(contacts, dummyUser);
        };

        await waitForAnyContactToBeAddedThen(makeAssertion);
    });

    it('should add all relationships between group members', async () => {
        await userRepo.insert(...dummyGroupMembers);

        await request(httpServer).post(`/${GROUPS_API_ROUTE}`).send({
            id: groupId,
            name: 'name',
            emoji: '🏕️',
            userIds,
        });

        const makeAssertion = (contacts: Array<Contact>): void => {
            expect(contacts.length).toBe(dummyGroupMembers.length - 1);
            expectNotToContainDefaultUser(contacts);
            expectAllUsersToHaveBeenAddedAsContacts(contacts, userIds);
        };

        await waitForAnyContactToBeAddedThen(makeAssertion);
    });

    async function waitForAnyContactToBeAddedThen(
        makeAssertionUsing: (...params: Array<any>) => void,
    ): Promise<void> {
        const startTime = Date.now();
        const POLLING_TIMEOUT_MS = 5000;
        const POLLING_INTERVAL_MS = 10;

        while (Date.now() - startTime < POLLING_TIMEOUT_MS) {
            const contacts = await getDefaultUserContacts();
            if (contacts.length > 0) {
                return makeAssertionUsing(contacts);
            }
            await setTimeout(POLLING_INTERVAL_MS);
        }

        throw new Error(
            `Test failed: condition not met within ${POLLING_TIMEOUT_MS}`,
        );
    }

    function getDefaultUserContacts(): Promise<Contact[]> {
        return contactRepo.getActorContacts(
            DEFAULT_USER.getId(),
            NO_PAGE_INDEX,
            NO_SEARCH,
        );
    }

    function expectUserToHaveBeenAddedIn(
        contacts: Array<Contact>,
        dummyUser: User,
    ): void {
        const [contact] = contacts;
        expect(contact?.getId()).toBe(dummyUser.getId());
    }

    function expectNotToContainDefaultUser(contacts: Array<Contact>): void {
        const contactsDoNotContainDefaultUser = contacts.every(
            (contact) => contact.getId() !== DEFAULT_USER.getId(),
        );
        expect(contactsDoNotContainDefaultUser).toBe(true);
    }

    function expectAllUsersToHaveBeenAddedAsContacts(
        contacts: Array<Contact>,
        userIds: Array<string>,
    ): void {
        const allUsersHaveBeenAddedAsContacts = contacts.every((contact) =>
            userIds.includes(contact.getId()),
        );
        expect(allUsersHaveBeenAddedAsContacts).toBe(true);
    }
});
