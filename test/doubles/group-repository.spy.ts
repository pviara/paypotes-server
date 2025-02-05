import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { Spy } from '@test/helpers/spy';

export class GroupRepositorySpy
    extends Spy<GroupRepository>
    implements GroupRepository
{
    readonly calls = {
        getById: {
            count: 0,
            history: [] as Array<string>,
        },
        save: {
            count: 0,
            history: [] as Array<Group>,
        },
    };

    async getById(id: string): Promise<Group | null> {
        this.calls.getById.count++;
        this.calls.getById.history.push(id);
        return this.getStubOrDefault('getById', null);
    }

    async save(group: Group): Promise<void> {
        this.calls.save.count++;
        this.calls.save.history.push(group);
        return this.getStubOrDefault('save', undefined);
    }
}
