import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Contact } from '@contacts/domain/contact';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { SQLTable } from '@app/shared/sql-table';
import { User } from '@users/domain/user';

type ContactRecord = {
    id: string;
    firstname: string;
    lastname: string;
    avatar_url: string;
};

export class ContactPostgresRepository implements ContactRepository {
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
                    .into(SQLTable.Relationships);
            }
        }
    }

    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        const record = await this.knex
            .select(`${SQLTable.Users}.*`)
            .from(SQLTable.Relationships)
            .innerJoin('users', (join) =>
                join
                    .on(
                        `${SQLTable.Relationships}.user_a_id`,
                        '=',
                        `${SQLTable.Users}.id`,
                    )
                    .orOn(
                        `${SQLTable.Relationships}.user_b_id`,
                        '=',
                        `${SQLTable.Users}.id`,
                    ),
            )
            .where((queryBuilder) => {
                queryBuilder
                    .where((subQueryBuilder) =>
                        subQueryBuilder
                            .where(
                                `${SQLTable.Relationships}.user_a_id`,
                                actorId,
                            )
                            .andWhere(
                                `${SQLTable.Relationships}.user_b_id`,
                                contactId,
                            ),
                    )
                    .orWhere((subQueryBuilder) =>
                        subQueryBuilder
                            .where(
                                `${SQLTable.Relationships}.user_a_id`,
                                contactId,
                            )
                            .andWhere(
                                `${SQLTable.Relationships}.user_b_id`,
                                actorId,
                            ),
                    );
            })
            .andWhereNot(`${SQLTable.Users}.id`, actorId)
            .first();

        return this.mapContactFrom(record);
    }

    async getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]> {
        const records = await this.knex
            .select(`${SQLTable.Users}.*`)
            .from(SQLTable.Relationships)
            .innerJoin('users', (join) =>
                join
                    .on(
                        `${SQLTable.Relationships}.user_a_id`,
                        '=',
                        `${SQLTable.Users}.id`,
                    )
                    .orOn(
                        `${SQLTable.Relationships}.user_b_id`,
                        '=',
                        `${SQLTable.Users}.id`,
                    ),
            )
            .where((queryBuilder) =>
                queryBuilder
                    .where(`${SQLTable.Relationships}.user_a_id`, actorId)
                    .orWhere(`${SQLTable.Relationships}.user_b_id`, actorId),
            )
            .andWhereNot(`${SQLTable.Users}.id`, actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder
                        .andWhereRaw(
                            `users.full_name @@ plainto_tsquery('simple', '${search.toLowerCase()}')`,
                        )
                        .orWhereILike(`${SQLTable.Users}.firstname`, search)
                        .orWhereILike(`${SQLTable.Users}.lastname`, search);
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
            .from(SQLTable.Relationships)
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
