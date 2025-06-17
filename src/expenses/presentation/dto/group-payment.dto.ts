import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { GroupPayment } from '@expenses/domain/group-expense';
import { MemberDTO } from '@groups/presentation/dto/member.dto';

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
