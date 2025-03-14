import { Expense, Metadata } from './expense';
import { Stakeholder } from './stakeholder';

export type PairPayment = {
    balance: number;
    creditor: Stakeholder;
    debtor: Stakeholder;
};

export class PairExpense extends Expense {
    constructor(
        metadata: Metadata,
        private payment: PairPayment,
    ) {
        super(metadata);
    }

    getBalance(): string {
        return `${this.payment.balance}`;
    }

    getCounterpartyOf(stakeholderId: string): Stakeholder {
        const { creditor, debtor } = this.payment;
        return creditor.getId() === stakeholderId ? debtor : creditor;
    }

    getRawBalance(): number {
        return this.payment.balance;
    }

    hasCreditor(stakeholderId: string) {
        const { creditor } = this.payment;
        return creditor.getId() === stakeholderId;
    }

    involves(...stakeholderIds: Array<string>): boolean {
        return stakeholderIds.every(this.eitherCreditorOrDebtor());
    }

    private eitherCreditorOrDebtor(): (stakeholderId: string) => boolean {
        return (stakeholderId: string) =>
            this.hasCreditor(stakeholderId) || this.hasDebtor(stakeholderId);
    }

    private hasDebtor(stakeholderId: string) {
        const { debtor } = this.payment;
        return debtor.getId() === stakeholderId;
    }
}
