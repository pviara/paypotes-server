import { GroupPayment } from '@app/expenses/domain/group-expense';
import { MemberDTO } from '@app/groups/presentation/dto/member.dto';
import { BalanceDTO } from '@app/shared/dto/balance.dto';

export class GroupPaymentDTO {
    private constructor(
        readonly balance: string,
        readonly member: MemberDTO,
    ) {}

    static from(payment: GroupPayment): GroupPaymentDTO {
        const balance = BalanceDTO.from(payment.balance).getValue();
        const member = MemberDTO.from(payment.creditor);
        return {
            balance,
            member,
        };
    }
}
