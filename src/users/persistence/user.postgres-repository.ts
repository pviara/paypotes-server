import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
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
    protected readonly table = 'users';

    constructor(@InjectKnex() protected knex: Knex) {}

    create(user: User): Promise<void> {
        const record = this.mapRecordFrom(user);
        return this.knex.insert(record).into(this.table);
    }

    async get(...userIds: Array<string>): Promise<Users> {
        const records = await this.knex
            .select('id', 'firstname', 'lastname', 'email', 'avatar_url')
            .from(this.table)
            .whereIn('id', userIds);
        return this.mapUsersFrom(records);
    }

    async getByEmail(email: string): Promise<User | null> {
        const [
            {
                rows: [record],
            },
        ] = await this.knex
            .select('id', 'firstname', 'lastname', 'email', 'avatar_url')
            .from(this.table)
            .where('email', email);
        return record ? this.mapUserFrom(record) : null;
    }

    async getByName(name: string): Promise<Users> {
        const records = await this.knex
            .select('id', 'firstname', 'lastname', 'email', 'avatar_url')
            .from(this.table)
            .whereRaw(
                `full_name @@ plainto_tsquery('simple', '${name.toLowerCase()}')`,
            )
            .orWhereILike('firstname', name)
            .orWhereILike('lastname', name);
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
}
