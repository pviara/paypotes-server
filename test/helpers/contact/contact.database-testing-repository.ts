import { ContactDatabaseRepository } from '@app/contacts/persistence/contact.database-repository';
import { Relationship } from '@test/helpers/contact/relationship';
import { Table } from '@infra/database/table';

export class ContactDatabaseTestingRepository extends ContactDatabaseRepository {
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
