import { Member } from '@groups/domain/member';

export class MemberDTO {
    private constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
        readonly avatarUrl: string,
    ) {}

    static from(member: Member): MemberDTO {
        return new MemberDTO(
            member.getId(),
            member.getFirstname(),
            member.getLastname(),
            member.getAvatarUrl(),
        );
    }
}
