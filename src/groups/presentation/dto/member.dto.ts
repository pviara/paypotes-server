import { Member } from '@app/groups/domain/member';

export class MemberDTO {
    constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
    ) {}

    static from(member: Member): MemberDTO {
        return new MemberDTO(
            member.getId(),
            member.getFirstname(),
            member.getLastname(),
        );
    }
}
