import { UserDTO } from '@users/presentation/user.dto';

export type GroupDTO = {
    id: string;
    name: string;
    emoji: string;
    members: Array<UserDTO>;
};
