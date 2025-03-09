import { User } from '@users/domain/user';

export class Stakeholder {
    constructor(
        private data: {
            id: string; // <=> userId
            firstname: string;
            lastname: string;
        },
    ) {}

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
