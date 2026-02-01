import { Table } from '@infra/database/table';
import { User } from '@users/domain/user';
import { UserDatabaseRepository } from '@app/users/persistence/user.database-repository';

export class UserDatabaseTestingRepository extends UserDatabaseRepository {
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
