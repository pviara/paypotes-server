import { Person, Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Shares } from './shares';

type PersonWithTheirShare = {
    person: Person;
    share: number;
};

type StakeholdersPayload = {
    balance: number;
    creditor: Person;
    debtors: Array<Person>;
};

export class Stakeholders {
    private constructor(private value: Array<Stakeholder>) {}

    static create(data: StakeholdersPayload): Array<Stakeholder> {
        const { balance } = data;
        const persons = [data.creditor].concat(data.debtors);
        const shares = Shares.calculate({ balance, persons });

        const stakeholders = this.mapStakeholdersFrom(data, shares);
        return new Stakeholders(stakeholders).value;
    }

    private static mapStakeholdersFrom(
        data: { balance: number; creditor: Person; debtors: Array<Person> },
        shares: Array<number>,
    ): Array<Stakeholder> {
        const debtors = this.mapDebtorsFrom(data.debtors, shares);
        const creditor = this.createCreditorFrom(data.creditor, debtors);
        return debtors.concat(creditor);
    }

    private static mapDebtorsFrom(
        debtors: Array<Person>,
        shares: Array<number>,
    ): Array<Stakeholder> {
        return debtors.map((debtor, index) =>
            Stakeholder.from(debtor, shares[index]),
        );
    }

    private static createCreditorFrom(
        creditor: Person,
        debtors: Array<Stakeholder>,
    ): Stakeholder {
        return Stakeholder.from(
            creditor,
            this.calculateDistributedSharesFrom(debtors),
        );
    }

    private static calculateDistributedSharesFrom(
        debtors: Array<Stakeholder>,
    ): number {
        return debtors.reduce(
            (previous, current) => previous + current.getShare(),
            0,
        );
    }
}
