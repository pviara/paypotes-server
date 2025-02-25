import { Contact } from '@contacts/domain/contact';

export class ContactDTO {
    constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
    ) {}

    static from(contact: Contact): ContactDTO {
        return new ContactDTO(
            contact.getId(),
            contact.getFirstname(),
            contact.getLastname(),
        );
    }
}
