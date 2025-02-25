import { AUTHENTICATED_USER } from '@test/doubles/auth/authenticated-user';
import { ContactRepositorySpy } from '@test/doubles/contact-repository.spy';
import {
    GetActorContactsHandler,
    GetActorContactsQuery,
} from '@contacts/application/get-actor-contacts.handler';

describe('GetActorContactsHandler', () => {
    let sut: GetActorContactsHandler;
    let contactRepo: ContactRepositorySpy;

    const dummyActorId = AUTHENTICATED_USER.getId();
    const dummyPageIndex = 0;
    const dummySearch = 'a contact firstname or lastname';

    const dummyQuery = new GetActorContactsQuery({
        actorId: dummyActorId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    beforeEach(() => {
        contactRepo = new ContactRepositorySpy();
        sut = new GetActorContactsHandler(contactRepo);
    });

    it("should retrieve the actor's contacts", async () => {
        await sut.execute(dummyQuery);
        expect(contactRepo.calls.getActorContacts.count).toBe(1);
        expect(contactRepo.calls.getActorContacts.history).toContainEqual([
            dummyActorId,
            dummyPageIndex,
            dummySearch,
        ]);
    });
});
