import { Expense } from '@app/expenses/domain/expense';

export class ExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
    ) {}

    static from(expense: Expense): ExpenseDTO {
        return {
            id: expense.getId(),
            label: expense.getLabel(),
            emoji: expense.getEmoji(),
            balance: expense.getBalance(),
        };
    }
}
