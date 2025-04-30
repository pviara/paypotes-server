import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import {
    contactTasksSpecModules as modules,
    contactTasksSpecProviders as providers,
} from '@test/helpers/contact/tasks/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { generateRandomUser } from '@test/helpers/user/utils';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { initMessagingRunnerWith } from '@test/helpers/application-runner/utils';
import { mapIdsFrom, shutdown } from '@test/helpers/utils';
import { setTimeout } from 'node:timers/promises';
import { User } from '@users/domain/user';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import * as request from 'supertest';

describe('contact application tasks', () => {
    const runner = initMessagingRunnerWith(modules, providers);

    let contactRepo: ContactRepository;
    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

    const NO_PAGE_INDEX = 0;
    const NO_SEARCH = '';

    beforeEach(async () => {
        await runner.bootstrap();

        contactRepo = runner.getRepository('contact');
        userRepo = runner.getRepository('user');
        httpServer = runner.getHttpServer();

        await userRepo.empty();
        await userRepo.insert(DEFAULT_USER);
    });

    afterEach(shutdown(runner));

    it('should add a relationship between pair expense users', async () => {
        const dummyUser = generateRandomUser();
        await userRepo.insert(dummyUser);

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

        const defaultUserContacts = await contactRepo.getActorContacts(
            DEFAULT_USER.getId(),
            NO_PAGE_INDEX,
            NO_SEARCH,
        );
        expect(defaultUserContacts.length).toBe(1);

        expectUserToHaveBeenAddedAsContact(defaultUserContacts, dummyUser);
    });

    it('should add all relationships between group members', async () => {
        const dummyGroupMembers = [
            DEFAULT_USER,
            generateRandomUser(),
            generateRandomUser(),
        ];
        await userRepo.insert(...dummyGroupMembers);

        const groupId = crypto.randomUUID();
        const userIds = mapIdsFrom(dummyGroupMembers);

        await request(httpServer).post(`/${GROUPS_API_ROUTE}`).send({
            id: groupId,
            name: 'name',
            emoji: '🏕️',
            userIds,
        });

        const defaultUserContacts = await contactRepo.getActorContacts(
            DEFAULT_USER.getId(),
            NO_PAGE_INDEX,
            NO_SEARCH,
        );
        expect(defaultUserContacts.length).toBe(dummyGroupMembers.length - 1);

        expectNotToContainDefaultUser(defaultUserContacts);
        expectAllUsersToHaveBeenAddedAsContacts(defaultUserContacts, userIds);
    });

    function expectUserToHaveBeenAddedAsContact(
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
