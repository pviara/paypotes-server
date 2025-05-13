import { Expense, Metadata } from '@expenses/domain/expense';
import { Stakeholder } from '@expenses/domain/stakeholder';

export type PairPayment = {
    balance: number;
    creditor: Stakeholder;
    debtor: Stakeholder;
}; // -> change this object
// into this:
// { stakeholders: [Stakeholder, Stakeholder] }
// and one of them will have share: 0,

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

    override getRawBalance(): number {
        return this.payment.balance;
    }

    override hasCreditor(stakeholderId: string) {
        const { creditor } = this.payment;
        return creditor.getId() === stakeholderId;
    }

    override involves(...stakeholderIds: Array<string>): boolean {
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
