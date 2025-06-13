import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { PairExpense } from '@expenses/domain/pair-expense';

export class PairExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
    ) {}

    static from(expense: PairExpense): PairExpenseDTO {
        const balance = BalanceDTO.from(+expense.getBalance());
        return new PairExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            balance.getValue(),
        );
    }
}
