import { Person } from '@expenses/domain/stakeholder/stakeholder';

export class Shares {
    private shares = this.calculate();

    constructor(
        private persons: Array<Person>,
        private balance: number,
    ) {}

    getValue(): Array<number> {
        return this.shares;
    }

    private calculate(): Array<number> {
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
}
