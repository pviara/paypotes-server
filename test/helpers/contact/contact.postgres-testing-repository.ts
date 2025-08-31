import { ContactPostgresRepository } from '@contacts/persistence/contact.postgres-repository';
import { Relationship } from '@contacts/persistence/relationship';
import { Table } from '@infra/postgres/table';

export class ContactPostgresTestingRepository extends ContactPostgresRepository {
    async empty(): Promise<void> {
        await this.knex.delete().from(Table.Relationships);
    }

    async insert(...relationships: Array<Relationship>): Promise<void> {
        for (const relationship of relationships) {
            await this.knex
                .insert({
                    user_a_id: relationship.userA.getId(),
                    user_b_id: relationship.userB.getId(),
                })
                .into(Table.Relationships);
        }
    }
}
