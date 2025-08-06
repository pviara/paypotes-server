import { Person, Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Shares } from './shares';

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
        const shares = new Shares(this.persons, this.balance).getValue();
        const personsAndTheirShare = this.assignSharesToPersons(shares);

        return personsAndTheirShare.map(({ person, share }) =>
            Stakeholder.from(person, share),
        );
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
