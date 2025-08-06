import { Expense, Metadata } from '@expenses/domain/expense/expense';
import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholder/stakeholders';

export type GroupPayment = {
    balance: number;
    creditor: Member;
};

export class GroupExpense extends Expense {
    constructor(
        metadata: Metadata,
        private group: Group,
        protected payment: GroupPayment,
        stakeholders: Array<Stakeholder>,
    ) {
        super(metadata, payment, stakeholders);
    }

    static create(
        metadata: Metadata,
        group: Group,
        payment: GroupPayment,
    ): GroupExpense {
        const stakeholders = this.mapStakeholdersFrom(group, payment);
        return new GroupExpense(metadata, group, payment, stakeholders);
    }

    belongsTo(groupId: string): boolean {
        return this.group.getId() === groupId;
    }

    getGroup(): Group {
        return this.group;
    }

    getPayment(): GroupPayment {
        return this.payment;
    }

    settleSharesOf(...stakeholderIds: Array<string>): void {
        return stakeholderIds
            .map((stakeholderId) => this.getStakeholderUsing(stakeholderId))
            .forEach((stakeholder) => stakeholder.settle());
    }

    private static mapStakeholdersFrom(
        group: Group,
        payment: GroupPayment,
    ): Array<Stakeholder> {
        const { balance } = payment;
        const members = group.getMembers();
        return new Stakeholders(members, balance).getValue();
    }
}
