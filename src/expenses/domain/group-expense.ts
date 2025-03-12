import { Group } from '@groups/domain/group';
import { Payment } from '@expenses/domain/expense';

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
