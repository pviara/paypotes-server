import { Expense, Metadata } from '@expenses/domain/expense/expense';
import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';
import { Nullable } from '@app/shared/nullable';
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

    getGroup(): Group {
        return this.group;
    }

    getPayment(): GroupPayment {
        return this.payment;
    }

    settleSharesOf(...stakeholderIds: Array<string>): void {
        return stakeholderIds.forEach((stakeholderId) =>
            this.settleShareOf(stakeholderId),
        );
    }
}

export class GroupExpenseBuilder {
    private metadata: Nullable<Metadata> = null;
    private group: Nullable<Group> = null;
    private payment: Nullable<GroupPayment> = null;
    private stakeholders: Array<Stakeholder> = [];

    build(): GroupExpense {
        if (!this.metadata || !this.group || !this.payment) {
            throw new Error('Invalid group expense to be built');
        }

        if (this.noStakeholders()) {
            this.stakeholders = this.mapStakeholdersFrom(
                this.group,
                this.payment,
            );
        }

        return new GroupExpense(
            this.metadata,
            this.group,
            this.payment,
            this.stakeholders,
        );
    }

    withMetadata(metadata: Metadata): this {
        this.metadata = metadata;
        return this;
    }

    withGroup(group: Group): this {
        this.group = group;
        return this;
    }

    withPayment(payment: GroupPayment): this {
        this.payment = payment;
        return this;
    }

    withStakeholders(stakeholders: Array<Stakeholder>): this {
        this.stakeholders = stakeholders;
        return this;
    }

    private noStakeholders(): boolean {
        return this.stakeholders.length === 0;
    }

    private mapStakeholdersFrom(
        group: Group,
        payment: GroupPayment,
    ): Array<Stakeholder> {
        const { balance, creditor } = payment;
        const debtors = group.getMembersExcluding(creditor.getId());
        return Stakeholders.create({ balance, creditor, debtors });
    }
}
