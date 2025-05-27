import { Expense, Metadata } from '@expenses/domain/expense';
import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholders';

export type GroupPayment = {
    balance: number;
    creditor: Member;
};

export class GroupExpense extends Expense {
    private stakeholders = this.mapStakeholdersFromGroupMembers();

    constructor(
        protected metadata: Metadata,
        private group: Group,
        private payment: GroupPayment,
    ) {
        super(metadata);
    }

    belongsTo(groupId: string): boolean {
        return this.group.getId() === groupId;
    }

    cloneUsing(balance: number): GroupExpense {
        return new GroupExpense(this.metadata, this.group, {
            ...this.payment,
            balance,
        });
    }

    getBalance(): string {
        return `${this.payment.balance}`;
    }

    getGroup(): Group {
        return this.group;
    }

    getShareOf(stakeholderId: string): number {
        return this.getStakeholderUsing(stakeholderId).getShare();
    }

    getStakeholders(): Array<Stakeholder> {
        return this.stakeholders;
    }

    settleShareOf(stakeholderId: string): void {
        return this.getStakeholderUsing(stakeholderId).settle();
    }

    override getRawBalance(): number {
        return this.payment.balance;
    }

    override hasCreditor(actorId: string): boolean {
        return this.payment.creditor.getId() === actorId;
    }

    override involves(stakeholderId: string): boolean {
        return (
            this.isCreditor(stakeholderId) || this.isStakeholder(stakeholderId)
        );
    }

    private mapStakeholdersFromGroupMembers(): Array<Stakeholder> {
        const members = this.group.getMembers();
        const { balance } = this.payment;
        return new Stakeholders(members, balance).getValue();
    }

    private getStakeholderUsing(stakeholderId: string): Stakeholder {
        const stakeholder = this.getStakeholders().find(
            (stakeholder) => stakeholder.getId() === stakeholderId,
        );
        if (stakeholder) return stakeholder;
        throw new Error('Actor stakeholder profile could not be found');
    }

    private getCreditor(): Member {
        return this.payment.creditor;
    }

    private isCreditor(stakeholderId: string): boolean {
        return this.getCreditor().getId() === stakeholderId;
    }

    private isStakeholder(stakeholderId: string): boolean {
        return this.stakeholders.some(
            (stakeholder) => stakeholder.getId() === stakeholderId,
        );
    }
}
