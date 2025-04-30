import { Contact } from '@contacts/domain/contact';
import { Relationship } from '@contacts/persistence/relationship';
import { User } from '@users/domain/user';

export interface ContactRepository {
    addRelationshipsBetween(users: Array<User>): Promise<void>;
    getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null>;
    getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]>;
}

const MAX_CONTACTS_PER_PAGE = 20;

export class ContactInMemoryRepository implements ContactRepository {
    protected relationships: Array<Relationship> = [];

    async addRelationshipsBetween(users: Array<User>): Promise<void> {
        for (const user of users) {
            const otherUsers = this.getOtherUsersThan(user, users);
            for (const otherUser of otherUsers) {
                const exists = await this.existsBetween(user, otherUser);
                if (exists) continue;

                this.relationships.push({
                    userA: Contact.fromUser(user),
                    userB: Contact.fromUser(otherUser),
                });
            }
        }
    }

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
        const start = pageIndex * MAX_CONTACTS_PER_PAGE;
        return this.relationships
            .filter(this.isRelationshipOf(actorId))
            .map(this.extractContactFromRelationshipOf(actorId))
            .filter(this.contactNamesMatch(search))
            .slice(start, start + MAX_CONTACTS_PER_PAGE);
    }

    private getOtherUsersThan(user: User, users: Array<User>): Array<User> {
        return users.filter((otherUser) => user.getId() !== otherUser.getId());
    }

    private async existsBetween(userA: User, userB: User): Promise<boolean> {
        return this.relationships
            .map(this.mapRelationshipToContactIds())
            .some(this.idsInclude(userA, userB));
    }

    private mapRelationshipToContactIds(): (
        value: Relationship,
    ) => Array<string> {
        return (relationship) => [
            relationship.userA.getId(),
            relationship.userB.getId(),
        ];
    }

    private idsInclude(
        userA: User,
        userB: User,
    ): (value: Array<string>) => unknown {
        return (ids) =>
            ids.includes(userA.getId()) && ids.includes(userB.getId());
    }

    private isRelationshipOf(
        actorId: string,
    ): (value: Relationship) => boolean {
        return (relationship) => {
            const isActorRelationship =
                relationship.userA.getId() === actorId ||
                relationship.userB.getId() === actorId;
            return isActorRelationship;
        };
    }

    private extractContactFromRelationshipOf(
        actorId: string,
    ): (relationship: Relationship) => Contact {
        return (relationship) => {
            return relationship.userA.getId() === actorId
                ? relationship.userB
                : relationship.userA;
        };
    }

    private contactMatches(contactId: string): (contact: Contact) => boolean {
        return (contact) => contact.getId() === contactId;
    }

    private contactNamesMatch(search: string): (contact: Contact) => boolean {
        const lowercasedSearch = search.toLowerCase();
        return (contact) =>
            contact.getFirstname().toLowerCase().includes(lowercasedSearch) ||
            contact.getLastname().toLowerCase().includes(lowercasedSearch);
    }
}
