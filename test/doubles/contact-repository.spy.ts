import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Spy } from '@test/helpers/spy';

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
    };

    async getActorContactById(
        actorId: string,
        contactId: string,
    ): Promise<Contact | null> {
        this.calls.getActorContactById.count++;
        this.calls.getActorContactById.history.push([actorId, contactId]);
        return this.getStubOrDefault('getActorContactById', null);
    }

    async getActorContacts(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Contact[]> {
        this.calls.getActorContacts.count++;
        this.calls.getActorContacts.history.push([actorId, pageIndex, search]);
        return this.getStubOrDefault('getActorContacts', []);
    }
}
