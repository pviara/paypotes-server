import { Group } from '@groups/domain/group';
import { Stakeholder } from './stakeholder';
import { Expense, Metadata } from './expense';

export type GroupPayment = {
    balance: number;
    creditor: Stakeholder;
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

    getGroup(): Group {
        return this.group;
    }

    getRawBalance(): number {
        return this.payment.balance;
    }

    hasCreditor(actorId: string): boolean {
        return this.payment.creditor.getId() === actorId;
    }

    involves(stakeholderId: string): boolean {
        const { creditor } = this.payment;
        const isCreditor = creditor.getId() === stakeholderId;
        const isGroupMember = this.group
            .getMembers()
            .some((member) => member.getId() === stakeholderId);
        return isCreditor || isGroupMember;
    }
}
