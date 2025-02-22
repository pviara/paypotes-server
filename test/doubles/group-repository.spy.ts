import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { Spy } from '@test/helpers/spy';

export class GroupRepositorySpy
    extends Spy<GroupRepository>
    implements GroupRepository
{
    readonly calls = {
        getActorGroupById: {
            count: 0,
            history: [] as Array<[string, string]>,
        },
        getActorGroups: {
            count: 0,
            history: [] as Array<[string, number, string]>,
        },
        save: {
            count: 0,
            history: [] as Array<Group>,
        },
    };

    async getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null> {
        this.calls.getActorGroupById.count++;
        this.calls.getActorGroupById.history.push([actorId, groupId]);
        return this.getStubOrDefault('getActorGroupById', null);
    }

    async getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        this.calls.getActorGroups.count++;
        this.calls.getActorGroups.history.push([actorId, pageIndex, search]);
        return this.getStubOrDefault('getActorGroups', []);
    }

    async save(group: Group): Promise<void> {
        this.calls.save.count++;
        this.calls.save.history.push(group);
        return this.getStubOrDefault('save', undefined);
    }
}
