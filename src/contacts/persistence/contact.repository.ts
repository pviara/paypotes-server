import { Contact } from '@contacts/domain/contact';

export interface ContactRepository {
    getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null>;
    getActorContacts(actorId: string): Promise<Contact[]>;
    saveActorContact(actorId: string, contact: Contact): Promise<void>;
}

export class ContactInMemoryRepository implements ContactRepository {
    protected contacts = new Map<string, Contact[]>();

    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        const contact = this.contacts
            .get(actorId)
            ?.find((contact) => contact.getId() === contactId);

        return contact ?? null;
    }

    async getActorContacts(actorId: string): Promise<Contact[]> {
        return this.contacts.get(actorId) ?? [];
    }

    async saveActorContact(actorId: string, contact: Contact): Promise<void> {
        if (this.contacts.has(actorId)) {
            this.contacts.get(actorId)?.push(contact);
        } else {
            this.contacts.set(actorId, [contact]);
        }
    }
}
