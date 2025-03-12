import { Expense, Metadata } from './expense';
import { Stakeholder } from './stakeholder';

type PairPayment = {
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

    involves(stakeholderId: string): boolean {
        const { creditor, debtor } = this.payment;
        const isCreditor = creditor.getId() === stakeholderId;
        const isDebtor = debtor.getId() === stakeholderId;
        return isCreditor || isDebtor;
    }
}
