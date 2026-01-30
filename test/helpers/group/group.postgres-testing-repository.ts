import { Group } from '@groups/domain/group';
import { GroupPostgresRepository } from '@groups/persistence/group.postgres-repository';
import { Table } from '@infra/database/table';

export class GroupPostgresTestingRepository extends GroupPostgresRepository {
    async empty(): Promise<void> {
        await this.knex
            .delete()
            .from(Table.Members)
            .whereNot('id', process.env.DEFAULT_UUID);

        await this.knex
            .delete()
            .from(Table.Groups)
            .whereNot('id', process.env.DEFAULT_UUID);
    }

    async groupSaved(id: string): Promise<boolean> {
        const rows = await this.knex
            .select('*')
            .from(Table.Groups)
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

        await this.knex.insert(groupRecords).into(Table.Groups);
        await this.knex.insert(memberRecords).into(Table.Members);
    }
}
