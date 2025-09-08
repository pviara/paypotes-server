import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Log } from '@infra/logger/log.decorator';
import { Table } from '@infra/postgres/table';
import { User, Users } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';

type UserRecord = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    avatar_url: string;
};

export class UserPostgresRepository implements UserRepository {
    constructor(@InjectKnex() protected knex: Knex) {}

    create(user: User): Promise<void> {
        return this.knex.insert(this.mapRecordFrom(user)).into(Table.Users);
    }

    async get(...userIds: Array<string>): Promise<Users> {
        const records = await this.knex
            .select()
            .from(Table.Users)
            .whereIn('id', userIds);

        return this.mapUsersFrom(records);
    }

    async getByEmail(email: string): Promise<User | null> {
        const user = await this.knex
            .select()
            .from(Table.Users)
            .where('email', email)
            .first();

        return user ? this.mapUserFrom(user) : null;
    }

    @Log('log')
    async getByName(name: string): Promise<Users> {
        const records = await this.knex
            .select()
            .from(Table.Users)
            .whereRaw(this.buildTextSearchQueryFor(name))
            .orWhereILike('firstname', `%${name}%`)
            .orWhereILike('lastname', `%${name}%`);

        return this.mapUsersFrom(records);
    }

    protected mapRecordsFrom(users: Array<User>): Array<UserRecord> {
        return users.map((user) => this.mapRecordFrom(user));
    }

    private mapRecordFrom(user: User): UserRecord {
        return {
            id: user.getId(),
            firstname: user.getFirstname(),
            lastname: user.getLastname(),
            email: user.getEmail(),
            avatar_url: user.getAvatarUrl(),
        };
    }

    private mapUsersFrom(records: Array<UserRecord>): Array<User> {
        return records.map((record) => this.mapUserFrom(record));
    }

    private mapUserFrom(record: UserRecord): User {
        return new User({
            id: record.id,
            firstname: record.firstname,
            lastname: record.lastname,
            email: record.email,
            avatarUrl: record.avatar_url,
        });
    }

    private buildTextSearchQueryFor(name: string): string {
        return `full_name @@ plainto_tsquery('simple', '${name.toLowerCase()}')`;
    }
}
