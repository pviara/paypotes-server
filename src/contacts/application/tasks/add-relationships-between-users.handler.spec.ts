import {
    AddRelationshipsBetweenUsersCommand,
    AddRelationshipsBetweenUsersHandler,
    RelationshipUserNotFoundError,
} from '@contacts/application/tasks/add-relationships-between-users.handler';
import { ContactRepositorySpy } from '@test/doubles/contact-repository.spy';
import {
    generateRandomUser,
    generateRandomUsers,
} from '@test/helpers/user/utils';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('AddRelationshipBetweenUsersHandler', () => {
    let sut: AddRelationshipsBetweenUsersHandler;

    let contactRepo: ContactRepositorySpy;
    let userRepo: UserRepositorySpy;

    const dummyCommand = new AddRelationshipsBetweenUsersCommand({
        userIds: [crypto.randomUUID(), crypto.randomUUID()],
    });

    const dummyUsers = generateRandomUsers({ length: 2 });

    beforeEach(() => {
        initSut();
        userRepo.stub('get', dummyUsers);
    });

    it('should retrieve both users from given command', async () => {
        await sut.execute(dummyCommand);

        expect(userRepo.calls.get.count).toBe(1);
        expect(userRepo.calls.get.history).toContainEqual(
            dummyCommand.payload.userIds,
        );
    });

    it('should throw an error if either one or the other user cannot be found', async () => {
        userRepo.stub('get', [generateRandomUser()]);

        await expect(sut.execute(dummyCommand)).rejects.toThrow(
            RelationshipUserNotFoundError,
        );
    });

    it('should save the relationship between the two users', async () => {
        await sut.execute(dummyCommand);

        expect(contactRepo.calls.addRelationshipBetween.count).toBe(1);

        expect(contactRepo.calls.addRelationshipBetween.history).toContainEqual(
            dummyUsers,
        );
    });

    function initSut(): void {
        initDependencies();
        sut = new AddRelationshipsBetweenUsersHandler(contactRepo, userRepo);
    }

    function initDependencies(): void {
        contactRepo = new ContactRepositorySpy();
        userRepo = new UserRepositorySpy();
    }
});
