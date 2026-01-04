import { User, Users } from '@users/domain/user';

export abstract class UserRepository {
    abstract create(user: User): Promise<void>;
    abstract get(...userIds: Array<string>): Promise<Users>;
    abstract getByEmail(email: string): Promise<User | null>;
    abstract getByName(name: string): Promise<Users>;
}
