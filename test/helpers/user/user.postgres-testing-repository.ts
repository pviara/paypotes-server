import { Table } from '@infra/postgres/table';
import { User } from '@users/domain/user';
import { UserPostgresRepository } from '@users/persistence/user.postgres-repository';

export class UserPostgresTestingRepository extends UserPostgresRepository {
    async empty(): Promise<void> {
        await this.knex
            .delete()
            .from(Table.Users)
            .whereNot('id', process.env.DEFAULT_UUID);
    }

    insert(...users: Array<User>): Promise<void> {
        const records = this.mapRecordsFrom(users);
        return this.knex.insert(records).into(Table.Users);
    }
}
