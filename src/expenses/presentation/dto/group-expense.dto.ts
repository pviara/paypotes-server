import { GroupExpense } from '@expenses/domain/group-expense';

export class GroupExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
    ) {}

    static from(expense: GroupExpense): GroupExpenseDTO {
        return {
            id: expense.getId(),
            label: expense.getLabel(),
            emoji: expense.getEmoji(),
            balance: expense.getBalance(),
        };
    }
}
