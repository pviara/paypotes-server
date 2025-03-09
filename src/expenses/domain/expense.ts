import { Stakeholder } from '@expenses/domain/stakeholder';

export type Payment = {
    balance: number;
    creditor: Stakeholder;
    debtor: Stakeholder;
};

export class Expense {
    constructor(
        private data: {
            id: string;
            label: string;
            emoji: string;
            payment: Payment;
        },
    ) {}

    getId(): string {
        return this.data.id;
    }

    getLabel(): string {
        return this.data.label;
    }

    getEmoji(): string {
        return this.data.emoji;
    }

    getBalance(): string {
        return `${this.data.payment.balance}`;
    }

    involves(stakeholderId: string): boolean {
        const { creditor, debtor } = this.data.payment;
        return (
            creditor.getId() === stakeholderId ||
            debtor.getId() === stakeholderId
        );
    }
}
