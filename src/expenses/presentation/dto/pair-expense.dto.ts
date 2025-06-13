import { PairExpenseSnapshot } from '@app/expenses/domain/pair-expense-snapshot';
import { BalanceDTO } from '@app/shared/dto/balance.dto';

export class PairExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
    ) {}

    static from(snapshot: PairExpenseSnapshot): PairExpenseDTO {
        const expense = snapshot.getExpense();
        const balance = BalanceDTO.from(snapshot.getPerspectiveBalance());
        return new PairExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            balance.getValue(),
        );
    }
}
