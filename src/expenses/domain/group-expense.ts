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
    protected stakeholders = this.mapStakeholdersFromGroupMembers();

    constructor(
        protected metadata: Metadata,
        private group: Group,
        protected payment: GroupPayment,
    ) {
        super(metadata, payment);
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

    getGroup(): Group {
        return this.group;
    }

    settleSharesOf(...stakeholderIds: Array<string>): void {
        return stakeholderIds
            .map((stakeholderId) => this.getStakeholderUsing(stakeholderId))
            .forEach((stakeholder) => stakeholder.settle());
    }

    private mapStakeholdersFromGroupMembers(): Array<Stakeholder> {
        const { balance } = this.payment;
        const members = this.group.getMembers();
        return new Stakeholders(members, balance).getValue();
    }
}
