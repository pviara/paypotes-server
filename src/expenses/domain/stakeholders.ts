import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder';

type MemberWithTheirShare = {
    member: Member;
    share: number;
};

export class Stakeholders {
    private stakeholders = this.mapStakeholdersWithTheirShare();

    getValue(): Array<Stakeholder> {
        return this.stakeholders;
    }

    constructor(
        private members: Array<Member>,
        private balance: number,
    ) {}

    private mapStakeholdersWithTheirShare(): Array<Stakeholder> {
        const shares = this.calculateShares();
        const membersAndTheirShare = this.assignSharesToMembers(shares);

        return membersAndTheirShare.map(({ member, share }) =>
            Stakeholder.from(member, share),
        );
    }

    private calculateShares(): Array<number> {
        const shares = this.getRoundedShares();
        const rest = this.calculateRestFrom(shares);

        for (let i = 0; i < rest; i++) shares[i]++;
        return shares;
    }

    private getRoundedShares(): Array<number> {
        const roundedShare = Math.floor(this.balance / this.members.length);
        return Array<number>(this.members.length).fill(roundedShare);
    }

    private calculateRestFrom(shares: Array<number>): number {
        const distributed = shares.reduce((prev, next) => prev + next, 0);
        return this.balance - distributed;
    }

    private assignSharesToMembers(
        shares: Array<number>,
    ): Array<MemberWithTheirShare> {
        return this.members.map((member, index) => ({
            member,
            share: shares[index],
        }));
    }
}
