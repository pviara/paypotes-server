import { GroupPayment } from '@expenses/domain/expense/group/group-expense';
import { PairPayment } from '@expenses/domain/expense/pair/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';

export type Metadata = {
    id: string;
    label: string;
    emoji: string;
    createdAt: Date;
};

type Payment = GroupPayment | PairPayment;

export abstract class Expense {
    protected constructor(
        protected metadata: Metadata,
        protected payment: Payment,
        protected stakeholders: Array<Stakeholder>,
    ) {}

    getBalance(): string {
        return `${this.payment.balance}`;
    }

    getCreatedAt(): string {
        return this.metadata.createdAt.toISOString();
    }

    getEmoji(): string {
        return this.metadata.emoji;
    }

    getId(): string {
        return this.metadata.id;
    }

    getLabel(): string {
        return this.metadata.label;
    }

    getRawBalance(): number {
        return this.payment.balance;
    }

    getShareOf(stakeholderId: string): number {
        return this.getStakeholderUsing(stakeholderId).getShare();
    }

    getStakeholders(): Array<Stakeholder> {
        return this.stakeholders;
    }

    getCounterpartiesOf(stakeholderId: string): Array<Stakeholder> {
        return this.getStakeholders().filter(
            (stakeholder) => stakeholder.getId() !== stakeholderId,
        );
    }

    hasCreditor(actorId: string): boolean {
        const { creditor } = this.payment;
        return creditor.getId() === actorId;
    }

    involves(...stakeholderIds: Array<string>): boolean {
        return stakeholderIds.every((stakeholderId) =>
            this.getStakeholders().some(
                (stakeholder) => stakeholder.getId() === stakeholderId,
            ),
        );
    }

    settleShareOf(stakeholderId: string): void {
        return this.getStakeholderUsing(stakeholderId).settle();
    }

    protected getStakeholderUsing(stakeholderId: string): Stakeholder {
        const stakeholder = this.getStakeholders().find(
            (stakeholder) => stakeholder.getId() === stakeholderId,
        );
        if (stakeholder) return stakeholder;
        throw new Error('Actor stakeholder profile could not be found');
    }
}
