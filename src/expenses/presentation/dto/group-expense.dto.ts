import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { GroupExpenseSnapshot } from '@app/expenses/domain/group-expense-snapshot';
import { GroupPaymentDTO } from '@expenses/presentation/dto/group-payment.dto';

export class GroupExpenseDTO {
    private constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
        readonly group: GroupDTO,
        readonly payment: GroupPaymentDTO,
    ) {}

    static from(snapshot: GroupExpenseSnapshot): GroupExpenseDTO {
        const expense = snapshot.getExpense();

        const balance = BalanceDTO.from(snapshot.getPerspectiveBalance());
        const group = GroupDTO.from(expense.getGroup());
        const payment = GroupPaymentDTO.from(expense.getPayment());

        return new GroupExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            balance.getValue(),
            group,
            payment,
        );
    }
}
