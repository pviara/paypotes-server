import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { GroupExpense } from '@expenses/domain/group-expense';

export class GroupExpenseDTO {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly balance: string,
        readonly group: GroupDTO,
    ) {}

    static from(expense: GroupExpense): GroupExpenseDTO {
        return {
            id: expense.getId(),
            label: expense.getLabel(),
            emoji: expense.getEmoji(),
            balance: expense.getBalance(),
            group: GroupDTO.from(expense.getGroup()),
        };
    }
}
