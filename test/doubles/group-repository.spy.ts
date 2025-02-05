import {
    CreateGroup,
    GroupRepository,
} from '@groups/persistence/group.repository';
import { Spy } from '@test/helpers/spy';

export class GroupRepositorySpy
    extends Spy<GroupRepository>
    implements GroupRepository
{
    readonly calls = {
        save: {
            count: 0,
            history: [] as Array<CreateGroup>,
        },
    };

    async save(group: CreateGroup): Promise<void> {
        this.calls.save.count++;
        this.calls.save.history.push(group);
        return this.getStubOrDefault('save', undefined);
    }
}
