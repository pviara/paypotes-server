import { User } from '@users/domain/user';

export class Group {
    constructor(
        private data: {
            id: string;
            name: string;
            emoji: string;
            members: Array<User>;
        },
    ) {}

    getEmoji(): string {
        return this.data.emoji;
    }

    getId(): string {
        return this.data.id;
    }

    getMembers(): Array<User> {
        return this.data.members;
    }

    getName(): string {
        return this.data.name;
    }
}
