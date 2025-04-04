import { ContactWithBalance } from '@contacts/domain/contact-with-balance';

export class ContactWithBalanceDTO {
    private static ZERO = 0;

    constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
        readonly balance: string,
    ) {}

    static from(contact: ContactWithBalance): ContactWithBalanceDTO {
        const balance = this.format(contact.getBalance());
        return new ContactWithBalanceDTO(
            contact.getId(),
            contact.getFirstname(),
            contact.getLastname(),
            balance,
        );
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
