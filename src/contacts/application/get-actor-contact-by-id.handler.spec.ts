import { AUTHENTICATED_USER } from '@test/doubles/auth/authenticated-user';
import { Contact } from '@contacts/domain/contact';
import { ContactRepositorySpy } from '@test/doubles/contact-repository.spy';
import {
    ContactNotFoundError,
    GetActorContactByIdHandler,
    GetActorContactByIdQuery,
} from '@contacts/application/get-actor-contact-by-id.handler';

describe('GetActorContactByIdHandler', () => {
    let sut: GetActorContactByIdHandler;
    let contactRepo: ContactRepositorySpy;

    const dummyActorId = AUTHENTICATED_USER.getId();
    const dummyContactId = crypto.randomUUID();
    const dummyQuery = new GetActorContactByIdQuery({
        actorId: dummyActorId,
        contactId: dummyContactId,
    });

    const dummyContact = new Contact({
        id: dummyContactId,
        firstname: 'Peter',
        lastname: 'Parker',
    });

    beforeEach(() => {
        contactRepo = new ContactRepositorySpy();
        sut = new GetActorContactByIdHandler(contactRepo);

        contactRepo.stub('getActorContactById', dummyContact);
    });

    it("should retrieve the actor's contact by its id", async () => {
        await sut.execute(dummyQuery);

        expect(contactRepo.calls.getActorContactById.count).toBe(1);
        expect(contactRepo.calls.getActorContactById.history).toContainEqual([
            dummyActorId,
            dummyContactId,
        ]);
    });

    it('should return the contact that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyContact);
    });

    describe("actor's contact doesn't exist", () => {
        it('should throw an error', async () => {
            contactRepo.stub('getActorContactById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                ContactNotFoundError,
            );
        });
    });
});
