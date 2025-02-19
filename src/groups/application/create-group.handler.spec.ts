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

    const dummyCommand = new CreateGroupCommand('id', 'name', 'emoji', [
        'id1',
        'id2',
        'id3',
    ]);

    let dummyUsers: Array<User>;

    beforeEach(() => {
        groupRepo = new GroupRepositorySpy();
        userRepo = new UserRepositorySpy();
        sut = new CreateGroupHandler(groupRepo, userRepo);

        dummyUsers = mapToUsers(dummyCommand.memberIds);
        userRepo.stub('get', dummyUsers);
    });

    it('should check that all group users exist', async () => {
        await sut.execute(dummyCommand);
        expect(userRepo.calls.get.count).toBe(1);
        expect(userRepo.calls.get.history).toContainEqual(
            dummyCommand.memberIds,
        );
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
                id: dummyCommand.id,
                name: dummyCommand.name,
                emoji: dummyCommand.emoji,
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
