import { Person } from '@expenses/domain/stakeholder/stakeholder';

type CalculateShares = {
    balance: number;
    persons: Array<Person>;
};

export class Shares {
    private constructor(private value: Array<number>) {}

    static calculate({ balance, persons }: CalculateShares): Array<number> {
        const shares = this.calculateRoundedSharesFrom(balance, persons);
        const rest = this.calculateRestFrom(balance, shares);
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
        const distributed = shares.reduce((prev, current) => prev + current, 0);
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
