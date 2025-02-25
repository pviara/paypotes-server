import { Group } from '@groups/domain/group';

export type CreateGroup = {
    id: string;
    name: string;
    emoji: string;
    memberIds: Array<string>;
};

export interface GroupRepository {
    getActorGroupById(actorId: string, groupId: string): Promise<Group | null>;
    getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]>;
    save(group: Group): Promise<void>;
}

export class GroupInMemoryRepository implements GroupRepository {
    //? Why using an array instead of a map like in the ContactRepository?
    //? Because we don't want to create multiple data for the same group.
    //? The information of who is inside this group is already withing the group object.
    protected groups: Array<Group> = [];

    async getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null> {
        const group = this.groups.find(
            (group: Group) => group.getId() === groupId,
        );
        return group ?? null;
    }

    async getActorGroups(
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
            return filteredGroups;
        }
        return paginatedGroups;
    }

    async save(group: Group): Promise<void> {
        this.groups.push(group);
    }
}
