import { Calculator } from '@expenses/domain/calculator';
import { Contact } from '@contacts/domain/contact';
import { Expense } from '@expenses/domain/expense';

export class ContactWithBalance extends Contact {
    private balance: number = 0;

    private constructor(
        protected data: {
            id: string;
            firstname: string;
            lastname: string;
            avatarUrl: string;
            expenses: Array<Expense>;
            perspectiveId: string;
        },
    ) {
        super({
            id: data.id,
            firstname: data.firstname,
            lastname: data.lastname,
            avatarUrl: data.avatarUrl,
        });
        this.balance = this.calcBalanceFor(data.perspectiveId);
    }

    static from(data: {
        contact: Contact;
        expenses: Array<Expense>;
        perspectiveId: string;
    }): ContactWithBalance {
        return new ContactWithBalance({
            id: data.contact.getId(),
            firstname: data.contact.getFirstname(),
            lastname: data.contact.getLastname(),
            avatarUrl: data.contact.getAvatarUrl(),
            expenses: data.expenses,
            perspectiveId: data.perspectiveId,
        });
    }

    getBalance(): number {
        return this.balance;
    }

    private calcBalanceFor(stakeholderId: string): number {
        const expenses = this.getExpenses();
        return new Calculator(expenses).calculateFor(stakeholderId);
    }

    private getExpenses(): Array<Expense> {
        return this.data.expenses;
    }
}
