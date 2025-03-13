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

    getMember(memberId: string) {
        const member = this.getMembers().find(
            (member) => member.getId() === memberId,
        );
        if (member) return member;
        throw new MemberNotInGroupError(memberId, this.getId());
    }

    getMembers(): Array<Member> {
        return this.data.members;
    }

    getMembersExcluding(memberId: string) {
        return this.getMembers().filter(
            (member) => member.getId() !== memberId,
        );
    }

    getName(): string {
        return this.data.name;
    }

    has(memberId: string): boolean {
        return this.getMembers().some((member) => member.getId() === memberId);
    }
}

export class MemberNotInGroupError extends Error {
    constructor(memberId: string, groupId: string) {
        super(
            `Member with id "${memberId}" is not a member of group with id "${groupId}"`,
        );
    }
}
