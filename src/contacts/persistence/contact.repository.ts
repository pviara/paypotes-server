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
