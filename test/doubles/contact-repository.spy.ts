import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Spy } from '@test/helpers/spy';
import { User } from '@users/domain/user';

export class ContactRepositorySpy
    extends Spy<ContactRepository>
    implements ContactRepository
{
    readonly calls = {
        getActorContactById: {
            count: 0,
            history: [] as Array<[string, string]>,
        },
        getActorContacts: {
            count: 0,
            history: [] as Array<[string, number, string]>,
        },
        addRelationshipsBetween: {
            count: 0,
            history: [] as Array<User[]>,
        },
    };

    async addRelationshipsBetween(users: Array<User>): Promise<void> {
        this.saveCall('addRelationshipsBetween', users);
        return this.getStubOrDefault('addRelationshipsBetween', undefined);
    }

    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        this.saveCall('getActorContactById', [actorId, contactId]);
        return this.getStubOrDefault('getActorContactById', null);
    }

    async getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]> {
        this.saveCall('getActorContacts', [actorId, pageIndex, search]);
        return this.getStubOrDefault('getActorContacts', []);
    }
}
