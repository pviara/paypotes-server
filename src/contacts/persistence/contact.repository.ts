import { Contact } from '@contacts/domain/contact';
import { Relationship } from './relationship';

export interface ContactRepository {
    getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null>;
    getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]>;
    saveActorContact(actorId: string, contact: Contact): Promise<void>;
}

export class ContactInMemoryRepository implements ContactRepository {
    protected relationships: Array<Relationship> = [];

    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        const contact = this.relationships
            .filter(this.isRelationshipOf(actorId))
            .map(this.extractContactFromRelationshipOf(actorId))
            .find(this.contactMatches(contactId));

        return contact ?? null;
    }

    async getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]> {
        const contacts = this.relationships
            .filter(this.isRelationshipOf(actorId))
            .map(this.extractContactFromRelationshipOf(actorId));

        const start = pageIndex * 20;
        const paginatedContacts = contacts.slice(start, start + 20);
        if (search) {
            const filteredContacts = paginatedContacts.filter(
                (contact) =>
                    contact.getFirstname().includes(search) ||
                    contact.getLastname().includes(search),
            );
            return filteredContacts;
        }
        return paginatedContacts;
    }

    async saveActorContact(actorId: string, contact: Contact): Promise<void> {
        /*if (this.relationships.has(actorId)) {
            this.relationships.get(actorId)?.push(contact);
        } else {
            this.relationships.set(actorId, [contact]);
        }*/
    }

    private isRelationshipOf(
        actorId: string,
    ): (value: Relationship) => boolean {
        return (relationship) => {
            // retrieve only actor's relationships
            const isActorRelationship =
                relationship.userA.getId() === actorId ||
                relationship.userB.getId() === actorId;
            return isActorRelationship;
        };
    }

    private extractContactFromRelationshipOf(
        actorId: string,
    ): (value: Relationship) => Contact {
        return (relationship) => {
            // retrieve only relationship contact
            return relationship.userA.getId() === actorId
                ? relationship.userB
                : relationship.userA;
        };
    }

    private contactMatches(contactId: string): (value: Contact) => boolean {
        return (contact) => contact.getId() === contactId;
    }
}
