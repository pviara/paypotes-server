import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder';

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
        const roundedShare = Math.floor(this.balance / this.members.length);
        const shares = Array(this.members.length).fill(roundedShare);

        const distributed = shares.reduce((prev, next) => prev + next, 0);
        const distribuable = this.balance - distributed;

        for (let i = 0; i < distribuable; i++) {
            shares[i]++;
        }

        const membersAndTheirShare = this.members.map((member, index) => [
            member,
            shares[index],
        ]);

        return membersAndTheirShare.map(([member, share]) =>
            Stakeholder.from(member, share),
        );
    }
}
