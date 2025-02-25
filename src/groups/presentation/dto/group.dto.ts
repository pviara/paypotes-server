import { MemberDTO } from '@groups/presentation/dto/member.dto';

export type GroupDTO = {
    id: string;
    name: string;
    emoji: string;
    members: Array<MemberDTO>;
};
