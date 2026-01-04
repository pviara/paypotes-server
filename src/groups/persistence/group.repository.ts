import { Group } from '@groups/domain/group';

export type CreateGroup = {
    id: string;
    name: string;
    emoji: string;
    memberIds: Array<string>;
};

export abstract class GroupRepository {
    abstract getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null>;
    abstract getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]>;
    abstract save(group: Group): Promise<void>;
}
