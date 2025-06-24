import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import { GroupExpenseSnapshot } from '@expenses/domain/group-expense-snapshot';
import { GroupPaymentDTO } from '@expenses/presentation/dto/group-payment.dto';
import {
    StakeholderDTO,
    StakeholderDTOs,
} from '@expenses/presentation/dto/stakeholder.dto';

export class GroupExpenseDTO {
    private constructor(
        readonly id: string,
        readonly label: string,
        readonly emoji: string,
        readonly createdAt: string,
        readonly balance: string,
        readonly group: GroupDTO,
        readonly payment: GroupPaymentDTO,
        readonly stakeholders: StakeholderDTOs,
    ) {}

    static from(snapshot: GroupExpenseSnapshot): GroupExpenseDTO {
        const expense = snapshot.getExpense();

        const balance = BalanceDTO.from(snapshot.getPerspectiveBalance());
        const group = GroupDTO.from(expense.getGroup());
        const payment = GroupPaymentDTO.from(expense.getPayment());
        const stakeholders = snapshot
            .getExpense()
            .getStakeholders()
            .map((stakeholder) => StakeholderDTO.from(stakeholder));

        return new GroupExpenseDTO(
            expense.getId(),
            expense.getLabel(),
            expense.getEmoji(),
            expense.getCreatedAt(),
            balance.getValue(),
            group,
            payment,
            stakeholders,
        );
    }
}
