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

    getActorGroupById(actorId: string, groupId: string): Promise<Group | null> {
        const group = this.groups.find(
            (group: Group) => group.getId() === groupId,
        );
        return Promise.resolve(group ?? null);
    }

    getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        const start = pageIndex * 20;
        const paginatedGroups = this.groups.slice(start, start + 20);
        if (search) {
            const filteredGroups = paginatedGroups.filter((group) =>
                group.getName().includes(search),
            );
            return Promise.resolve(filteredGroups);
        }
        return Promise.resolve(paginatedGroups);
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
