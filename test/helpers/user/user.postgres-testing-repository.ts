import { Table } from '@infra/database/table';
import { User } from '@users/domain/user';
import { UserPostgresRepository } from '@users/persistence/user.postgres-repository';

export class UserPostgresTestingRepository extends UserPostgresRepository {
    async empty(): Promise<void> {
        await this.knex
            .delete()
            .from(Table.Users)
            .whereNot('id', process.env.DEFAULT_UUID);
    }

    async insert(...users: Array<User>): Promise<void> {
        const records = this.mapRecordsFrom(users);
        await this.knex
            .insert(records)
            .into(Table.Users)
            .onConflict('id')
            .ignore();
    }
}
