import { User } from '@users/domain/user';

export type SignedInRequest = Request & {
    user: User;
};
