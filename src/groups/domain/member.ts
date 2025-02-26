import { User } from '@users/domain/user';

export class Member {
    constructor(
        private data: {
            id: string; // <=> userId
            firstname: string;
            lastname: string;
        },
    ) {}

    static fromUser(user: User): Member {
        return new Member({
            id: user.getId(),
            firstname: user.getFirstname(),
            lastname: user.getLastname(),
        });
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
