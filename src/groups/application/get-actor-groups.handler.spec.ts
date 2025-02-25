import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import {
    GetActorGroupsHandler,
    GetActorGroupsQuery,
} from '@groups/application/get-actor-groups.handler';
import { GroupRepositorySpy } from '@test/doubles/group-repository.spy';

describe('GetAllGroupsHandler', () => {
    let sut: GetActorGroupsHandler;
    let groupRepo: GroupRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyPageIndex = 0;
    const dummySearch = 'a group name';

    const dummyQuery = new GetActorGroupsQuery({
        actorId: dummyActorId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    beforeEach(() => {
        groupRepo = new GroupRepositorySpy();
        sut = new GetActorGroupsHandler(groupRepo);
    });

    it("should retrieve the actor's groups", async () => {
        await sut.execute(dummyQuery);
        expect(groupRepo.calls.getActorGroups.count).toBe(1);
        expect(groupRepo.calls.getActorGroups.history).toContainEqual([
            dummyActorId,
            dummyPageIndex,
            dummySearch,
        ]);
    });
});
