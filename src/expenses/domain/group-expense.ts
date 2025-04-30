import { Expense, Metadata } from '@expenses/domain/expense';
import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder';

export type GroupPayment = {
    balance: number;
    creditor: Stakeholder;
};

export class GroupExpense extends Expense {
    private participants: Array<Stakeholder>;

    constructor(
        metadata: Metadata,
        private group: Group,
        private payment: GroupPayment,
    ) {
        super(metadata);
        this.participants = this.getParticipants();
        console.dir(this.participants, { depth: null });
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

    override getRawBalance(): number {
        return this.payment.balance;
    }

    override hasCreditor(actorId: string): boolean {
        return this.payment.creditor.getId() === actorId;
    }

    override involves(stakeholderId: string): boolean {
        const { creditor } = this.payment;
        const isCreditor = creditor.getId() === stakeholderId;
        const isGroupMember = this.group
            .getMembers()
            .some((member) => member.getId() === stakeholderId);
        return isCreditor || isGroupMember;
    }

    private getParticipants(): Array<Stakeholder> {
        const creditorId = this.getCreditor().getId();
        const membersExceptCreditor =
            this.group.getMembersExcluding(creditorId);
        return this.mapToStakeholders(membersExceptCreditor);
    }

    private getCreditor(): Stakeholder {
        return this.payment.creditor;
    }

    private mapToStakeholders(members: Array<Member>): Array<Stakeholder> {
        return members.map((member) => Stakeholder.fromMember(member));
    }
}
