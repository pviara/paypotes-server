import { User } from '@users/domain/user';

export interface UserRepository {
    get(...userIds: Array<string>): Promise<User[]>;
}

export class UserInMemoryRepository {}
