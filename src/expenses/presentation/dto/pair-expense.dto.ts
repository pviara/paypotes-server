import { PairExpense } from '@expenses/domain/pair-expense';

export class PairExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
    ) {}

    static from(expense: PairExpense): PairExpenseDTO {
        return {
            id: expense.getId(),
            label: expense.getLabel(),
            emoji: expense.getEmoji(),
            balance: expense.getBalance(),
        };
    }
}
