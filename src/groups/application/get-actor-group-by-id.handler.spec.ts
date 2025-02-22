import { AUTHENTICATED_USER } from '@test/doubles/auth/authenticated-user';
import {
    GetActorGroupByIdHandler,
    GetActorGroupByIdQuery,
    GroupNotFoundError,
} from '@app/groups/application/get-actor-group-by-id.handler';
import { Group } from '@groups/domain/group';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';

describe('GetGroupByIdHandler', () => {
    let sut: GetActorGroupByIdHandler;
    let groupRepo: GroupRepositorySpy;

    const dummyActorId = AUTHENTICATED_USER.getId();
    const dummyGroupId = crypto.randomUUID();
    const dummyQuery = new GetActorGroupByIdQuery({
        actorId: dummyActorId,
        groupId: dummyGroupId,
    });

    const dummyGroup = new Group({
        id: dummyGroupId,
        name: 'name',
        emoji: '🚧',
        members: [],
    });

    beforeEach(() => {
        groupRepo = new GroupRepositorySpy();
        sut = new GetActorGroupByIdHandler(groupRepo);

        groupRepo.stub('getActorGroupById', dummyGroup);
    });

    it('should retrieve the group by its id', async () => {
        await sut.execute(dummyQuery);

        expect(groupRepo.calls.getActorGroupById.count).toBe(1);
        expect(groupRepo.calls.getActorGroupById.history).toContainEqual([
            dummyActorId,
            dummyGroupId,
        ]);
    });

    it('should return the group that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyGroup);
    });

    describe("group doesn't exist", () => {
        it('should throw an error', async () => {
            groupRepo.stub('getActorGroupById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                GroupNotFoundError,
            );
        });
    });
});
