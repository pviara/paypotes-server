import { ContactInMemoryRepository } from '@contacts/persistence/contact.repository';
import { Relationship } from '@contacts/persistence/relationship';

export class ContactInMemoryTestingRepository extends ContactInMemoryRepository {
    async empty(): Promise<void> {
        this.relationships = [];
    }

    async insert(...relationships: Array<Relationship>): Promise<void> {
        this.relationships.push(...relationships);
    }
}
