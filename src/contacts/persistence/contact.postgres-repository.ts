import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Contact } from '@contacts/domain/contact';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { User } from '@users/domain/user';

type ContactRecord = {
    id: string;
    firstname: string;
    lastname: string;
    avatar_url: string;
};

export class ContactPostgresRepository implements ContactRepository {
    protected readonly table = 'relationships';

    constructor(@InjectKnex() protected knex: Knex) {}

    async addRelationshipsBetween(users: Array<User>): Promise<void> {
        for (const user of users) {
            const otherUsers = this.getOtherUsersThan(user, users);
            for (const otherUser of otherUsers) {
                const exists = await this.existsBetween(user, otherUser);
                if (exists) continue;

                await this.knex
                    .insert({
                        user_a_id: user.getId(),
                        user_b_id: otherUser.getId(),
                    })
                    .into(this.table);
            }
        }
    }

    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        const record = await this.knex
            .select('users.*')
            .from(this.table)
            .innerJoin('users', (join) =>
                join
                    .on(`${this.table}.user_a_id`, '=', 'users.id')
                    .orOn(`${this.table}.user_b_id`, '=', 'users.id'),
            )
            .where((queryBuilder) => {
                queryBuilder
                    .where((subQueryBuilder) =>
                        subQueryBuilder
                            .where(`${this.table}.user_a_id`, actorId)
                            .andWhere(`${this.table}.user_b_id`, contactId),
                    )
                    .orWhere((subQueryBuilder) =>
                        subQueryBuilder
                            .where(`${this.table}.user_a_id`, contactId)
                            .andWhere(`${this.table}.user_b_id`, actorId),
                    );
            })
            .andWhereNot('users.id', actorId)
            .first();

        return this.mapContactFrom(record);
    }

    async getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]> {
        const records = await this.knex
            .select('users.*')
            .from(this.table)
            .innerJoin('users', (join) =>
                join
                    .on(`${this.table}.user_a_id`, '=', 'users.id')
                    .orOn(`${this.table}.user_b_id`, '=', 'users.id'),
            )
            .where((queryBuilder) =>
                queryBuilder
                    .where(`${this.table}.user_a_id`, actorId)
                    .orWhere(`${this.table}.user_b_id`, actorId),
            )
            .andWhereNot('users.id', actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder
                        .andWhereRaw(
                            `users.full_name @@ plainto_tsquery('simple', '${search.toLowerCase()}')`,
                        )
                        .orWhereILike('users.firstname', search)
                        .orWhereILike('users.lastname', search);
                }
            })
            .offset(pageIndex * 20)
            .limit(20);

        return this.mapContactsFrom(records);
    }

    private getOtherUsersThan(user: User, users: Array<User>): Array<User> {
        return users.filter((otherUser) => user.getId() !== otherUser.getId());
    }

    private async existsBetween(userA: User, userB: User): Promise<boolean> {
        const records = await this.knex
            .select()
            .from(this.table)
            .where((subQueryBuilder) =>
                subQueryBuilder
                    .where('user_a_id', userA.getId())
                    .andWhere('user_b_id', userB.getId()),
            )
            .orWhere((subQueryBuilder) =>
                subQueryBuilder
                    .where('user_a_id', userB.getId())
                    .andWhere('user_b_id', userA.getId()),
            );
        return records.length > 0;
    }

    private mapContactsFrom(records: Array<ContactRecord>): Array<Contact> {
        return records.map((record) => this.mapContactFrom(record));
    }

    private mapContactFrom(record: ContactRecord): Contact {
        return new Contact({
            id: record.id,
            firstname: record.firstname,
            lastname: record.lastname,
            avatarUrl: record.avatar_url,
        });
    }
}
