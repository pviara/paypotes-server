export class BalanceDTO {
    private static ZERO = 0;

    constructor(private balance: string) {}

    static from(balance: number): BalanceDTO {
        const formatted = this.format(balance);
        return new BalanceDTO(formatted);
    }

    getValue(): string {
        return this.balance;
    }

    private static format(balance: number): string {
        return balance === this.ZERO
            ? this.formatZero(balance)
            : `${this.convertCents(balance)}`.replace('.', ',');
    }

    private static formatZero(balance: number): string {
        return `${balance.toFixed(2)}`.replace('.', ',');
    }

    private static convertCents(balance: number): number {
        return balance / 100;
    }
}
