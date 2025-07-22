import { Expense, Metadata } from '@expenses/domain/expense';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholder/stakeholders';
import { User } from '@users/domain/user';

export type PairPayment = {
    balance: number;
    creditor: User;
    debtor: User;
};

export class PairExpense extends Expense {
    protected stakeholders = this.mapStakeholdersFromUsers();

    constructor(
        metadata: Metadata,
        protected payment: PairPayment,
    ) {
        super(metadata, payment);
    }

    cloneUsing(balance: number): PairExpense {
        return new PairExpense(this.metadata, {
            ...this.payment,
            balance,
        });
    }

    settleCounterpartyShareOf(stakeholderId: string): void {
        const [counterparty] = this.getCounterpartiesOf(stakeholderId);
        return counterparty.settle();
    }

    private mapStakeholdersFromUsers(): Array<Stakeholder> {
        const { balance, creditor, debtor } = this.payment;
        const users = [creditor, debtor];
        return new Stakeholders(users, balance).getValue();
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

    //todo -> delete this because it's used only in tests
    getCounterpartyOf(stakeholderId: string): Stakeholder {
        const { creditor, debtor } = this.payment;
        return creditor.getId() === stakeholderId
            ? this.getMatchingStakeholder(debtor)
            : this.getMatchingStakeholder(creditor);
    }
}
