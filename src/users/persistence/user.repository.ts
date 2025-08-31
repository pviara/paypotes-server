import { User, Users } from '@users/domain/user';

export interface UserRepository {
    create(user: User): Promise<void>;
    get(...userIds: Array<string>): Promise<Users>;
    getByEmail(email: string): Promise<User | null>;
    getByName(name: string): Promise<Users>;
}
