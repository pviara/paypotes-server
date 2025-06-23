import { ContactDTO } from '@contacts/presentation/dto/contact.dto';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { PairExpenseSnapshot } from '@expenses/domain/pair-expense-snapshot';

export class PairExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly createdAt: string,
        readonly balance: string,
        readonly counterparty: ContactDTO,
    ) {}

    static from(snapshot: PairExpenseSnapshot): PairExpenseDTO {
        const expense = snapshot.getExpense();
        const balance = BalanceDTO.from(snapshot.getPerspectiveBalance());
        const counterparty = snapshot.getCounterparty();

        return new PairExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            expense.getCreatedAt(),
            balance.getValue(),
            ContactDTO.from(counterparty),
        );
    }
}
