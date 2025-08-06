import { Person, Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Shares } from '@expenses/domain/stakeholder/shares';

type CreateStakeholders = {
    balance: number;
    creditor: Person;
    debtors: Array<Person>;
};

export class Stakeholders {
    private constructor(private value: Array<Stakeholder>) {}

    static create(data: CreateStakeholders): Array<Stakeholder> {
        const { balance, creditor, debtors } = data;
        const persons = [creditor].concat(debtors);
        const shares = Shares.calculate({ balance, persons });

        const stakeholders = this.mapStakeholdersFrom(data, shares);
        return new Stakeholders(stakeholders).value;
    }

    private static mapStakeholdersFrom(
        data: CreateStakeholders,
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
