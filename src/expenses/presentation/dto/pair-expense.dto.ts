import { ContactWithoutBalanceDTO } from '@app/contacts/presentation/dto/list/contact-without-balance.dto';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';

export class PairExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly createdAt: string,
        readonly balance: string,
        readonly counterparty: ContactWithoutBalanceDTO,
    ) {}

    static from(snapshot: PairExpenseSnapshot): PairExpenseDTO {
        const expense = snapshot.getExpense();
        const balance = BalanceDTO.from(snapshot.getPerspectiveBalance());
        const counterparty = snapshot.getPerspectiveCounterparty();

        return new PairExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            expense.getCreatedAt(),
            balance.getValue(),
            ContactWithoutBalanceDTO.from(counterparty),
        );
    }
}
