import { User } from '@app/users/domain/user';

export class Contact {
    constructor(
        protected data: {
            id: string; // <=> userId
            firstname: string;
            lastname: string;
            avatarUrl: string;
        },
    ) {}

    static fromUser(user: User): Contact {
        return new Contact({
            id: user.getId(),
            firstname: user.getFirstname(),
            lastname: user.getLastname(),
            avatarUrl: user.getAvatarUrl(),
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
}
