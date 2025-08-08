import { Group } from '@groups/domain/group';
import { GroupPostgresRepository } from '@groups/persistence/group.postgres-repository';

export class GroupPostgresTestingRepository extends GroupPostgresRepository {
    async empty(): Promise<void> {
        await this.knex
            .delete()
            .from(this.memberTable)
            .whereNot('id', process.env.DEFAULT_UUID);

        await this.knex
            .delete()
            .from(this.groupTable)
            .whereNot('id', process.env.DEFAULT_UUID);
    }

    async groupSaved(id: string): Promise<boolean> {
        const rows = await this.knex
            .select('*')
            .from(this.groupTable)
            .where('id', id);
        return rows.length > 0;
    }

    async insert(...groups: Array<Group>): Promise<void> {
        const groupRecords = this.mapGroupRecordsFrom(groups);
        const memberRecords = groups
            .map((group) => ({
                members: group.getMembers(),
                groupId: group.getId(),
            }))
            .flatMap(({ members, groupId }) =>
                this.mapMemberRecordsFrom(members, groupId),
            );

        await this.knex.insert(groupRecords).into(this.groupTable);
        await this.knex.insert(memberRecords).into(this.memberTable);
    }
}
