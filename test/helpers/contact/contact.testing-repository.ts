import { Contact } from '@contacts/domain/contact';
import { ContactInMemoryRepository } from '@contacts/persistence/contact.repository';

export class ContactInMemoryTestingRepository extends ContactInMemoryRepository {
    contactSaved(actorId: string, contactId: string): boolean {
        return (
            this.contacts
                .get(actorId)
                ?.some((contact) => contact.getId() === contactId) ?? false
        );
    }

    async empty(): Promise<void> {
        this.contacts.clear();
    }

    async insert(actorId: string, ...contacts: Array<Contact>): Promise<void> {
        this.contacts.set(actorId, contacts);
    }
}
