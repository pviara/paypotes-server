import { Contact } from '@contacts/domain/contact';
import { Member } from '@groups/domain/member';
import { User } from '@users/domain/user';

export type Person = Contact | Member | User;

export class Stakeholder {
    constructor(
        private data: {
            id: string; // <=> userId
            firstname: string;
            lastname: string;
            share: number;
        },
    ) {}

    static from(person: Contact | Member | User, share = 0): Stakeholder {
        return new Stakeholder({
            id: person.getId(),
            firstname: person.getFirstname(),
            lastname: person.getLastname(),
            share,
        });
    }

    getId(): string {
        return this.data.id;
    }

    getShare(): number {
        return this.data.share;
    }

    shareEquals(number: number): boolean {
        return this.getShare() === number;
    }
}
