import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { GroupWithBalance } from '@groups/domain/group-with-balance';
import { Member } from '@groups/domain/member';
import { MemberDTO } from '@groups/presentation/dto/member.dto';

export class GroupWithBalanceDTO {
    private constructor(
        readonly id: string,
        readonly name: string,
        readonly emoji: string,
        readonly members: Array<MemberDTO>,
        readonly balance: string,
    ) {}

    static from(group: GroupWithBalance): GroupWithBalanceDTO {
        const balance = BalanceDTO.from(group.getBalance());
        const members = this.fromMembers(group.getMembers());
        return new GroupWithBalanceDTO(
            group.getId(),
            group.getName(),
            group.getEmoji(),
            members,
            balance.getValue(),
        );
    }

    private static fromMembers(member: Array<Member>): Array<MemberDTO> {
        return member.map((member) => MemberDTO.from(member));
    }
}
