import { Group } from '@groups/domain/group';
import { Payment } from '@app/expenses/domain/simple-expense';

export class GroupExpense {
    constructor(
        private data: {
            id: string;
            label: string;
            emoji: string;
            payment: Payment;
            group: Group;
        },
    ) {}
}
