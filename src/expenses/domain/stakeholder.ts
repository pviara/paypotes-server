import { Contact } from '@contacts/domain/contact';
import { Member } from '@groups/domain/member';
import { User } from '@users/domain/user';

export class Stakeholder {
    constructor(
        private data: {
            id: string; // <=> userId
            firstname: string;
            lastname: string;
            // part: number;
        },
    ) {}

    static fromContact(contact: Contact): Stakeholder {
        return new Stakeholder({
            id: contact.getId(),
            firstname: contact.getFirstname(),
            lastname: contact.getLastname(),
        });
    }

    static fromMember(member: Member): Stakeholder {
        return new Stakeholder({
            id: member.getId(),
            firstname: member.getFirstname(),
            lastname: member.getLastname(),
        });
    }

    static fromUser(user: User): Stakeholder {
        return new Stakeholder({
            id: user.getId(),
            firstname: user.getFirstname(),
            lastname: user.getLastname(),
        });
    }

    getId(): string {
        return this.data.id;
    }
}
