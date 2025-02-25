import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import {
    CreateGroupCommand,
    CreateGroupHandler,
    MemberNotFoundError,
} from '@groups/application/create-group.handler';
import { Group } from '@groups/domain/group';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';
import { User } from '@users/domain/user';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('CreateGroupHandler', () => {
    let sut: CreateGroupHandler;
    let groupRepo: GroupRepositorySpy;
    let userRepo: UserRepositorySpy;

    const dummyGroupId = crypto.randomUUID();
    const dummyGroupName = 'Holidays';
    const dummyGroupEmoji = '🏖️';
    const dummyMemberIds = [
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
    ];

    const dummyCommand = new CreateGroupCommand({
        id: dummyGroupId,
        name: dummyGroupName,
        emoji: dummyGroupEmoji,
        memberIds: dummyMemberIds,
    });

    let dummyUsers: Array<User>;

    beforeEach(() => {
        groupRepo = new GroupRepositorySpy();
        userRepo = new UserRepositorySpy();
        sut = new CreateGroupHandler(groupRepo, userRepo);

        dummyUsers = mapToUsers(dummyMemberIds);
        userRepo.stub('get', dummyUsers);
    });

    it('should check that all group users exist', async () => {
        await sut.execute(dummyCommand);
        expect(userRepo.calls.get.count).toBe(1);
        expect(userRepo.calls.get.history).toContainEqual(dummyMemberIds);
    });

    describe("some group users don't exist", () => {
        beforeEach(() => {
            dummyUsers.pop();
            userRepo.stub('get', dummyUsers);
        });

        it('should throw an error', async () => {
            await expect(sut.execute(dummyCommand)).rejects.toThrow(
                MemberNotFoundError,
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
                members: dummyUsers,
            });
            expect(groupRepo.calls.save.history).toContainEqual(group);
        });
    });

    function mapToUsers(memberIds: Array<string>): Array<User> {
        return memberIds.map(
            (memberId: string, index: number) =>
                new User({
                    id: memberId,
                    firstname: `F_${index}`,
                    lastname: `L_${index}`,
                }),
        );
    }
});
