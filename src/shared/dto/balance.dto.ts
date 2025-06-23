export class BalanceDTO {
    private constructor(private balance: string) {}

    static from(balance: number): BalanceDTO {
        const formatted = this.format(balance);
        return new BalanceDTO(formatted);
    }

    getValue(): string {
        return this.balance;
    }

    private static format(balance: number): string {
        const value = this.convertCents(balance).toFixed(2);
        return value.replace('.', ',');
    }

    private static convertCents(balance: number): number {
        return balance / 100;
    }
}
