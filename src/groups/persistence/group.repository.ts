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
