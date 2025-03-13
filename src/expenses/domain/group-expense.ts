import { Group } from '@groups/domain/group';
import { Stakeholder } from './stakeholder';
import { Expense, Metadata } from './expense';

export type GroupPayment = {
    balance: number;
    creditor: Stakeholder;
    debtors: Array<Stakeholder>;
};

export class GroupExpense extends Expense {
    constructor(
        metadata: Metadata,
        private group: Group,
        private payment: GroupPayment,
    ) {
        super(metadata);
    }

    belongsTo(groupId: string): boolean {
        return this.group.getId() === groupId;
    }

    getBalance(): string {
        return `${this.payment.balance}`;
    }

    involves(stakeholderId: string): boolean {
        const { creditor, debtors } = this.payment;
        const isCreditor = creditor.getId() === stakeholderId;
        const isDebtor = debtors.some(
            (debtor) => debtor.getId() === stakeholderId,
        );
        return isCreditor || isDebtor;
    }
}
