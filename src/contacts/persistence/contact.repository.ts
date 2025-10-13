import { Contact } from '@contacts/domain/contact';
import { User } from '@users/domain/user';

export abstract class ContactRepository {
    abstract addRelationshipsBetween(users: Array<User>): Promise<void>;
    abstract getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null>;
    abstract getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]>;
}
