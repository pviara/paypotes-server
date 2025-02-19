import {
    GetManyGroupsHandler,
    GetManyGroupsQuery,
} from '@groups/application/get-many-groups.handler';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';

describe('GetAllGroupsHandler', () => {
    let sut: GetManyGroupsHandler;
    let groupRepo: GroupRepositorySpy;

    const dummyQuery = new GetManyGroupsQuery();

    beforeEach(() => {
        groupRepo = new GroupRepositorySpy();
        sut = new GetManyGroupsHandler(groupRepo);
    });

    it('should get groups from repository', async () => {
        await sut.execute(dummyQuery);
        expect(groupRepo.calls.getMany.count).toBe(1);
    });
});
