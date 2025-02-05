import { Group } from '@groups/domain/group';

export type CreateGroup = {
    name: string;
    emoji: string;
    memberIds: Array<string>;
};

export interface GroupRepository {
    save(group: CreateGroup): Promise<void>;
}

export class GroupInMemoryRepository implements GroupRepository {
    save(group: CreateGroup): Promise<void> {
        return Promise.resolve(undefined);
    }
}
