import { Member } from '@groups/domain/member';

export class Group {
    constructor(
        private data: {
            id: string;
            name: string;
            emoji: string;
            members: Array<Member>;
        },
    ) {}

    getEmoji(): string {
        return this.data.emoji;
    }

    getId(): string {
        return this.data.id;
    }

    getMembers(): Array<Member> {
        return this.data.members;
    }

    getName(): string {
        return this.data.name;
    }
}
