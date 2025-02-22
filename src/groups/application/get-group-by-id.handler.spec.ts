import { AUTHENTICATED_USER } from '@test/doubles/auth/authenticated-user';
import {
    GetGroupByIdHandler,
    GetGroupByIdQuery,
    GroupNotFoundError,
} from '@groups/application/get-group-by-id.handler';
import { Group } from '@groups/domain/group';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';

describe('GetGroupByIdHandler', () => {
    let sut: GetGroupByIdHandler;
    let groupRepo: GroupRepositorySpy;

    const dummyId = crypto.randomUUID();
    const dummyQuery = new GetGroupByIdQuery({
        actor: AUTHENTICATED_USER,
        id: dummyId,
    });

    const dummyGroup = new Group({
        id: dummyId,
        name: 'name',
        emoji: '🚧',
        members: [],
    });

    beforeEach(() => {
        groupRepo = new GroupRepositorySpy();
        sut = new GetGroupByIdHandler(groupRepo);

        groupRepo.stub('getById', dummyGroup);
    });

    it('should retrieve the group by its id', async () => {
        await sut.execute(dummyQuery);

        expect(groupRepo.calls.getById.count).toBe(1);
        expect(groupRepo.calls.getById.history).toContain(dummyId);
    });

    it('should return the group that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyGroup);
    });

    describe("group doesn't exist", () => {
        it('should throw an error', async () => {
            groupRepo.stub('getById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                GroupNotFoundError,
            );
        });
    });
});
