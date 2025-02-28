import { Stakeholder } from '@expenses/domain/stakeholder';

type Payment = {
    balance: number;
    creditor: Stakeholder;
    debtor: Stakeholder;
};

export class Expense {
    constructor(
        private data: {
            id: string;
            label: string;
            emoji: string;
            payment: Payment;
        },
    ) {}
}
