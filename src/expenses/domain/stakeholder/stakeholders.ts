import { Person, Stakeholder } from '@expenses/domain/stakeholder/stakeholder';

type PersonWithTheirShare = {
    person: Person;
    share: number;
};

export class Stakeholders {
    private stakeholders = this.mapStakeholdersWithTheirShare();

    constructor(
        private persons: Array<Person>,
        private balance: number,
    ) {}

    getValue(): Array<Stakeholder> {
        return this.stakeholders;
    }

    private mapStakeholdersWithTheirShare(): Array<Stakeholder> {
        const shares = this.calculateShares();
        const personsAndTheirShare = this.assignSharesToPersons(shares);

        return personsAndTheirShare.map(({ person, share }) =>
            Stakeholder.from(person, share),
        );
    }

    private calculateShares(): Array<number> {
        const shares = this.getRoundedShares();
        const rest = this.calculateRestFrom(shares);

        for (let i = 0; i < rest; i++) shares[i]++;
        return shares;
    }

    private getRoundedShares(): Array<number> {
        const roundedShare = Math.floor(this.balance / this.persons.length);
        return Array(this.persons.length).fill(roundedShare);
    }

    private calculateRestFrom(shares: Array<number>): number {
        const distributed = shares.reduce((prev, next) => prev + next, 0);
        return this.balance - distributed;
    }

    private assignSharesToPersons(
        shares: Array<number>,
    ): Array<PersonWithTheirShare> {
        return this.persons.map((person, index) => ({
            person,
            share: shares[index],
        }));
    }
}
