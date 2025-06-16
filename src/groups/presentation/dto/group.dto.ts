import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';
import { MemberDTO } from '@groups/presentation/dto/member.dto';

export class GroupDTO {
    private constructor(
        readonly id: string,
        readonly name: string,
        readonly emoji: string,
        readonly members: Array<MemberDTO>,
    ) {}

    static from(group: Group): GroupDTO {
        return new GroupDTO(
            group.getId(),
            group.getName(),
            group.getEmoji(),
            this.fromMembers(group.getMembers()),
        );
    }

    private static fromMembers(member: Array<Member>): Array<MemberDTO> {
        return member.map((member) => MemberDTO.from(member));
    }
}
