import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Contact } from '@contacts/domain/contact';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Log } from '@infra/logger/log.decorator';
import { Table } from '@infra/postgres/table';
import { User } from '@users/domain/user';

type ContactRecord = {
    id: string;
    firstname: string;
    lastname: string;
    avatar_url: string;
};

export class ContactPostgresRepository implements ContactRepository {
    constructor(@InjectKnex() protected knex: Knex) {}

    @Log('debug')
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
                    .into(Table.Relationships);
            }
        }
    }

    @Log('debug')
    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        const contact = await this.knex
            .select(`${Table.Users}.*`)
            .from(Table.Relationships)
            .innerJoin(Table.Users, (join) =>
                join
                    .on(
                        `${Table.Relationships}.user_a_id`,
                        '=',
                        `${Table.Users}.id`,
                    )
                    .orOn(
                        `${Table.Relationships}.user_b_id`,
                        '=',
                        `${Table.Users}.id`,
                    ),
            )
            .where((queryBuilder) => {
                queryBuilder
                    .where((subQueryBuilder) =>
                        subQueryBuilder
                            .where(`${Table.Relationships}.user_a_id`, actorId)
                            .andWhere(
                                `${Table.Relationships}.user_b_id`,
                                contactId,
                            ),
                    )
                    .orWhere((subQueryBuilder) =>
                        subQueryBuilder
                            .where(
                                `${Table.Relationships}.user_a_id`,
                                contactId,
                            )
                            .andWhere(
                                `${Table.Relationships}.user_b_id`,
                                actorId,
                            ),
                    );
            })
            .andWhereNot(`${Table.Users}.id`, actorId)
            .first();

        return this.mapContactFrom(contact);
    }

    @Log('debug')
    async getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]> {
        const contacts = await this.knex
            .select(`${Table.Users}.*`)
            .from(Table.Relationships)
            .innerJoin(Table.Users, (join) =>
                join
                    .on(
                        `${Table.Relationships}.user_a_id`,
                        '=',
                        `${Table.Users}.id`,
                    )
                    .orOn(
                        `${Table.Relationships}.user_b_id`,
                        '=',
                        `${Table.Users}.id`,
                    ),
            )
            .where((queryBuilder) =>
                queryBuilder
                    .where(`${Table.Relationships}.user_a_id`, actorId)
                    .orWhere(`${Table.Relationships}.user_b_id`, actorId),
            )
            .andWhereNot(`${Table.Users}.id`, actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder
                        .andWhereRaw(
                            `${Table.Users}.full_name @@ plainto_tsquery('simple', '${search.toLowerCase()}')`,
                        )
                        .orWhereILike(`${Table.Users}.firstname`, `%${search}%`)
                        .orWhereILike(`${Table.Users}.lastname`, `%${search}%`);
                }
            })
            .offset(pageIndex * 20)
            .limit(20);

        return this.mapContactsFrom(contacts);
    }

    private getOtherUsersThan(user: User, users: Array<User>): Array<User> {
        return users.filter((otherUser) => user.getId() !== otherUser.getId());
    }

    private async existsBetween(userA: User, userB: User): Promise<boolean> {
        const relationship = await this.knex
            .select()
            .from(Table.Relationships)
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
        return relationship.length > 0;
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
