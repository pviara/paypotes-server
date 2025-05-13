import { User } from '@app/users/domain/user';
import { Expense, Metadata } from '@expenses/domain/expense';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { Stakeholders } from './stakeholders';

export type PairPayment = {
    balance: number;
    creditor: User;
    debtor: User;
};

export class PairExpense extends Expense {
    private stakeholders = this.mapStakeholdersFromUsers();

    constructor(
        metadata: Metadata,
        private payment: PairPayment,
    ) {
        super(metadata);
    }

    getBalance(): string {
        return `${this.payment.balance}`;
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

    override getRawBalance(): number {
        return this.payment.balance;
    }

    override hasCreditor(stakeholderId: string) {
        const { creditor } = this.payment;
        return creditor.getId() === stakeholderId;
    }

    override involves(...stakeholderIds: Array<string>): boolean {
        return stakeholderIds.every(this.eitherCreditorOrDebtor());
    }

    private mapStakeholdersFromUsers(): Array<Stakeholder> {
        const { balance, creditor, debtor } = this.payment;
        const users = [creditor, debtor];
        return new Stakeholders(users, balance).getValue();
    }

    private eitherCreditorOrDebtor(): (stakeholderId: string) => boolean {
        return (stakeholderId: string) =>
            this.hasCreditor(stakeholderId) || this.hasDebtor(stakeholderId);
    }

    private hasDebtor(stakeholderId: string) {
        const { debtor } = this.payment;
        return debtor.getId() === stakeholderId;
    }
}
