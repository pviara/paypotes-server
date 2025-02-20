import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';

export interface GroupTestingRepository extends GroupRepository {
    empty(): Promise<void>;
    groupSaved(id: string): boolean;
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

    getMany(): Promise<Group[]> {
        return Promise.resolve(this.groups.slice(0, 20));
    }

    groupSaved(id: string): boolean {
        return this.groups.some((group) => group.getId() === id);
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
