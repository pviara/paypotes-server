import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Contact } from '@contacts/domain/contact';

export class ContactWithoutBalanceDTO {
    private constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
        readonly avatarUrl: string,
    ) {}

    static from(contact: Contact | Stakeholder): ContactWithoutBalanceDTO {
        return new ContactWithoutBalanceDTO(
            contact.getId(),
            contact.getFirstname(),
            contact.getLastname(),
            contact.getAvatarUrl(),
        );
    }
}
