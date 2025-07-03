import { User } from '@users/domain/user';

export type SignedInUser = {
    user: User;
    token: string;
};
