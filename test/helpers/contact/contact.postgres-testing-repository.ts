import { Relationship } from '@contacts/persistence/relationship';
import { ContactPostgresRepository } from '@contacts/persistence/contact.postgres-repository';

export class ContactPostgresTestingRepository extends ContactPostgresRepository {
    async empty(): Promise<void> {
        await this.knex.delete().from(this.table);
    }

    async insert(...relationships: Array<Relationship>): Promise<void> {
        for (const relationship of relationships) {
            await this.knex
                .insert({
                    user_a_id: relationship.userA.getId(),
                    user_b_id: relationship.userB.getId(),
                })
                .into(this.table);
        }
    }
}
