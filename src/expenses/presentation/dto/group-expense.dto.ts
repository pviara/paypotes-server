import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { GroupExpense } from '@expenses/domain/group-expense';
import { BalanceDTO } from '@app/shared/dto/balance.dto';

export class GroupExpenseDTO {
    private constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
        readonly group: GroupDTO,
    ) {}

    static from(expense: GroupExpense): GroupExpenseDTO {
        const balance = BalanceDTO.from(+expense.getBalance());
        return new GroupExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            balance.getValue(),
            GroupDTO.from(expense.getGroup()),
        );
    }
}
