import { Person } from '@expenses/domain/stakeholder/stakeholder';

class Stakeholder {
    constructor(private share: number) {}

    static create(share: number): Stakeholder {
        return new Stakeholder(share);
    }

    getShare(): number {
        return this.share;
    }
}

class Stakeholders {
    private constructor(private value: Array<Stakeholder>) {}

    static create(data: {
        balance: number;
        creditor: Person;
        debtors: Array<Person>;
    }): Array<Stakeholder> {
        const { balance } = data;
        const persons = [data.creditor].concat(data.debtors);
        const shares = Shares.calculate({ balance, persons });

        const stakeholders = this.mapStakeholdersFrom(data, shares);
        return new Stakeholders(stakeholders).value;
    }

    private static mapStakeholdersFrom(
        data: { balance: number; creditor: {}; debtors: Array<{}> },
        shares: Array<number>,
    ): Array<Stakeholder> {
        const debtors = this.mapDebtorsFrom(data.debtors, shares);
        const creditor = this.createCreditorFrom(debtors);
        return debtors.concat(creditor);
    }

    private static mapDebtorsFrom(
        debtors: Array<{}>,
        shares: Array<number>,
    ): Array<Stakeholder> {
        return debtors.map((_, index) => Stakeholder.create(shares[index]));
    }

    private static createCreditorFrom(
        debtors: Array<Stakeholder>,
    ): Stakeholder {
        return Stakeholder.create(this.calculateDistributedSharesFrom(debtors));
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

class Shares {
    private constructor(private value: Array<number>) {}

    static calculate(data: {
        balance: number;
        persons: Array<Person>;
    }): Array<number> {
        const shares = this.calculateRoundedSharesFrom(
            data.balance,
            data.persons,
        );
        const rest = this.calculateRestFrom(data.balance, shares);
        const fullyDistributedShares = this.redistribute(rest, shares);
        return new Shares(fullyDistributedShares).value;
    }

    private static calculateRoundedSharesFrom(
        balance: number,
        persons: Array<Person>,
    ): Array<number> {
        const roundedShare = Math.floor(balance / persons.length);
        return Array(persons.length).fill(roundedShare);
    }

    private static calculateRestFrom(
        balance: number,
        shares: Array<number>,
    ): number {
        const distributed = shares.reduce((prev, next) => prev + next, 0);
        return balance - distributed;
    }

    private static redistribute(
        rest: number,
        shares: Array<number>,
    ): Array<number> {
        const newShares = Array.from(shares);
        for (let i = 0; i < rest; i++) newShares[i]++;

        return newShares;
    }
}
