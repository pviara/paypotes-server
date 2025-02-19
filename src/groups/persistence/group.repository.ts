import { Group } from '@groups/domain/group';

export type CreateGroup = {
    id: string;
    name: string;
    emoji: string;
    memberIds: Array<string>;
};

export interface GroupRepository {
    getById(id: string): Promise<Group | null>;
    getMany(): Promise<Group[]>;
    save(group: Group): Promise<void>;
}

export class GroupInMemoryRepository implements GroupRepository {
    getMany(): Promise<Group[]> {
        throw new Error('Method not implemented.');
    }
    getById(id: string): Promise<Group | null> {
        throw new Error('Method not implemented.');
    }
    save(group: Group): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
