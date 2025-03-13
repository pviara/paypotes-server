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

    involves(...stakeholderIds: Array<string>): boolean {
        return stakeholderIds.every(this.eitherCreditorOrDebtor());
    }

    private eitherCreditorOrDebtor(): (stakeholderId: string) => boolean {
        const { creditor, debtor } = this.payment;
        return (stakeholderId: string) => {
            const isCreditor = creditor.getId() === stakeholderId;
            const isDebtor = debtor.getId() === stakeholderId;
            return isCreditor || isDebtor;
        };
    }
}
