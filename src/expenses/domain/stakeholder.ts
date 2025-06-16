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
            avatarUrl: string;
            share: number;
        },
    ) {}

    static from(person: Contact | Member | User, share = 0): Stakeholder {
        return new Stakeholder({
            id: person.getId(),
            firstname: person.getFirstname(),
            lastname: person.getLastname(),
            avatarUrl: person.getAvatarUrl(),
            share,
        });
    }

    getAvatarUrl(): string {
        return this.data.avatarUrl;
    }

    getId(): string {
        return this.data.id;
    }

    getFirstname(): string {
        return this.data.firstname;
    }

    getLastname(): string {
        return this.data.lastname;
    }

    getShare(): number {
        return this.data.share;
    }

    settle(): void {
        this.data.share = 0;
    }

    shareEquals(number: number): boolean {
        return this.getShare() === number;
    }
}
