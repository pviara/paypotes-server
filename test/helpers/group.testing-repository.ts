import { GroupRepository } from '@groups/persistence/group.repository';
import { Group } from '@groups/domain/group';

export interface GroupTestingRepository extends GroupRepository {
    empty(): Promise<void>;
    insert(...groups: Array<Group>): Promise<void>;
}

export class GroupInMemoryTestingRepository implements GroupTestingRepository {
    private groups: Array<Group> = [];

    empty(): Promise<void> {
        this.groups = [];
        return Promise.resolve();
    }

    getById(id: string): Promise<Group | null> {
        const group = this.groups.find((group: Group) => group.getId() === id);
        return Promise.resolve(group ?? null);
    }

    insert(...groups: Array<Group>): Promise<void> {
        this.groups.push(...groups);
        return Promise.resolve();
    }

    save(group: Group): Promise<void> {
        this.groups.push(group);
        return Promise.resolve();
    }
}
