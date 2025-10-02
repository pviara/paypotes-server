import { Expense, Metadata } from '@expenses/domain/expense/expense';
import { Nullable } from '@app/shared/nullable';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholder/stakeholders';
import { User } from '@users/domain/user';

export type PairPayment = {
    balance: number;
    creditor: User;
    debtor: User;
};

export class PairExpense extends Expense {
    constructor(
        metadata: Metadata,
        protected payment: PairPayment,
        stakeholders: Array<Stakeholder>,
    ) {
        super(metadata, payment, stakeholders);
    }

    getCounterpartyOf(stakeholderId: string): Stakeholder {
        const { creditor, debtor } = this.payment;
        return creditor.getId() === stakeholderId
            ? this.getMatchingStakeholder(debtor)
            : this.getMatchingStakeholder(creditor);
    }

    private getMatchingStakeholder(debtor: User): Stakeholder {
        const stakeholder = this.stakeholders.find(
            (stakeholder) => stakeholder.getId() === debtor.getId(),
        );
        if (stakeholder) return stakeholder;

        throw new Error(
            'No stakeholder could be found for debtor with id ${debtor.getId()}',
        );
    }
}

export class PairExpenseBuilder {
    private metadata: Nullable<Metadata> = null;
    private payment: Nullable<PairPayment> = null;
    private stakeholders: Array<Stakeholder> = [];

    build(): PairExpense {
        if (!this.metadata || !this.payment) {
            throw new Error('Invalid pair expense to be built');
        }

        if (this.noStakeholders()) {
            this.stakeholders = this.mapStakeholdersFrom(this.payment);
        }

        return new PairExpense(this.metadata, this.payment, this.stakeholders);
    }

    withMetadata(metadata: Metadata): this {
        this.metadata = metadata;
        return this;
    }

    withPayment(payment: PairPayment): this {
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

    private mapStakeholdersFrom(payment: PairPayment): Array<Stakeholder> {
        const { balance, creditor, debtor } = payment;
        return Stakeholders.create({ balance, creditor, debtors: [debtor] });
    }
}
