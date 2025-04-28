import { ContactTaskMessengerSpy } from '@test/doubles/contact-task-messenger.spy';
import {
    CreateGroupCommand,
    CreateGroupHandler,
    GroupUserNotFoundError,
} from '@groups/application/create-group.handler';
import { Group } from '@groups/domain/group';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';
import { Member } from '@groups/domain/member';
import { User } from '@users/domain/user';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('CreateGroupHandler', () => {
    let sut: CreateGroupHandler;

    let groupRepo: GroupRepositorySpy;
    let userRepo: UserRepositorySpy;
    let messenger: ContactTaskMessengerSpy;

    const dummyGroupId = crypto.randomUUID();
    const dummyGroupName = 'Holidays';
    const dummyGroupEmoji = '🏖️';
    const dummyUserIds = [
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
    ];

    const dummyCommand = new CreateGroupCommand({
        id: dummyGroupId,
        name: dummyGroupName,
        emoji: dummyGroupEmoji,
        userIds: dummyUserIds,
    });

    let dummyUsers: Array<User>;

    beforeEach(() => {
        initSut();

        dummyUsers = mapToUsers(dummyUserIds);
        userRepo.stub('get', dummyUsers);
    });

    it('should check that all group users exist', async () => {
        await sut.execute(dummyCommand);
        expect(userRepo.calls.get.count).toBe(1);
        expect(userRepo.calls.get.history).toContainEqual(dummyUserIds);
    });

    describe("some group users don't exist", () => {
        beforeEach(() => {
            dummyUsers.pop();
            userRepo.stub('get', dummyUsers);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                GroupUserNotFoundError,
            );
        });
    });

    describe('all group users exist', () => {
        it('should save group', async () => {
            await sut.execute(dummyCommand);
            expect(groupRepo.calls.save.count).toBe(1);

            const group = new Group({
                id: dummyGroupId,
                name: dummyGroupName,
                emoji: dummyGroupEmoji,
                members: mapToMembers(dummyUsers),
            });

            expect(groupRepo.calls.save.history).toContainEqual(group);
        });

        it('should send a message using contact task messenger', async () => {
            await sut.execute(dummyCommand);
            expect(
                messenger.calls.sendRelationshipsMustBeCreatedBetween.count,
            ).toBe(1);
            expect(
                messenger.calls.sendRelationshipsMustBeCreatedBetween.history,
            ).toContainEqual(dummyUsers);
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new CreateGroupHandler(groupRepo, userRepo, messenger);
    }

    function initDependencies(): void {
        groupRepo = new GroupRepositorySpy();
        userRepo = new UserRepositorySpy();
        messenger = new ContactTaskMessengerSpy();
    }

    function mapToUsers(memberIds: Array<string>): Array<User> {
        return memberIds.map(
            (memberId: string, index: number) =>
                new User({
                    id: memberId,
                    firstname: `F_${index}`,
                    lastname: `L_${index}`,
                    email: 'email@test.com',
                    phone: '0754235460',
                }),
        );
    }

    function mapToMembers(users: Array<User>): Array<Member> {
        return users.map((user) => Member.fromUser(user));
    }
});
