import { Expense, Metadata } from '@expenses/domain/expense/expense';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholder/stakeholders';
import { User } from '@users/domain/user';

export type PairPayment = {
    balance: number;
    creditor: User;
    debtor: User;
};

export class PairExpense extends Expense {
    private constructor(
        metadata: Metadata,
        protected payment: PairPayment,
        stakeholders: Array<Stakeholder>,
    ) {
        super(metadata, payment, stakeholders);
    }

    static create(metadata: Metadata, payment: PairPayment): PairExpense {
        const stakeholders = this.mapStakeholdersFrom(payment);
        return new PairExpense(metadata, payment, stakeholders);
    }

    static fromState(
        metadata: Metadata,
        payment: PairPayment,
        stakeholders: Array<Stakeholder>,
    ): PairExpense {
        return new PairExpense(metadata, payment, stakeholders);
    }

    getCounterpartyOf(stakeholderId: string): Stakeholder {
        const { creditor, debtor } = this.payment;
        return creditor.getId() === stakeholderId
            ? this.getMatchingStakeholder(debtor)
            : this.getMatchingStakeholder(creditor);
    }

    settleCounterpartyShareOf(stakeholderId: string): void {
        const [counterparty] = this.getCounterpartiesOf(stakeholderId);
        return counterparty.settle();
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

    private static mapStakeholdersFrom(
        payment: PairPayment,
    ): Array<Stakeholder> {
        const { balance, creditor, debtor } = payment;
        return Stakeholders.create({ balance, creditor, debtors: [debtor] });
    }
}
