import { User } from '@users/domain/user';

export type SignedInUser = {
    token: string;
    user: User;
};
