import { Group } from '@groups/domain/group';
import { GroupInMemoryRepository } from '@groups/persistence/group.repository';

export class GroupInMemoryTestingRepository extends GroupInMemoryRepository {
    async empty(): Promise<void> {
        this.groups = [];
    }

    groupSaved(id: string): boolean {
        return this.groups.some((group) => group.getId() === id);
    }

    async insert(...groups: Array<Group>): Promise<void> {
        this.groups.push(...groups);
    }
}
