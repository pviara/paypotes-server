import { Group } from '@groups/domain/group';

export type CreateGroup = {
    id: string;
    name: string;
    emoji: string;
    memberIds: Array<string>;
};

const MAX_GROUPS_PER_PAGE = 20;

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
    protected groups: Array<Group> = [];

    async getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null> {
        return (
            this.groups
                .filter(this.isGroupOf(actorId))
                .find(this.groupMatches(groupId)) ?? null
        );
    }

    async getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        const start = pageIndex * MAX_GROUPS_PER_PAGE;
        return this.groups
            .filter(this.isGroupOf(actorId))
            .filter(this.groupNameMatches(search))
            .slice(start, start + MAX_GROUPS_PER_PAGE);
    }

    async save(group: Group): Promise<void> {
        this.groups.push(group);
    }

    private isGroupOf(actorId: string): (group: Group) => boolean {
        return (group) =>
            group.getMembers().some((member) => member.getId() === actorId);
    }

    private groupMatches(groupId: string): (group: Group) => boolean {
        return (group) => group.getId() === groupId;
    }

    private groupNameMatches(search: string): (group: Group) => boolean {
        return (group) =>
            group.getName().toLowerCase().includes(search.toLowerCase());
    }
}
