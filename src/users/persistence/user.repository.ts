import { User } from '@users/domain/user';

export interface UserRepository {
    create(user: User): Promise<void>;
    get(...userIds: Array<string>): Promise<User[]>;
    getByEmail(email: string): Promise<User | null>;
    getByPhone(phone: string): Promise<User | null>;
}

export class UserInMemoryRepository implements UserRepository {
    protected users: Array<User> = [];

    async create(user: User): Promise<void> {
        this.users.push(user);
    }

    async get(...userIds: Array<string>): Promise<User[]> {
        const users = this.users.filter(this.userIdFiguresIn(userIds));
        return users;
    }

    async getByEmail(email: string): Promise<User | null> {
        const user = this.users.find((user) => user.getEmail() === email);
        return user ?? null;
    }

    async getByPhone(phone: string): Promise<User | null> {
        const user = this.users.find((user) => user.getPhone() === phone);
        return user ?? null;
    }

    private userIdFiguresIn(userIds: Array<string>): (user: User) => boolean {
        return (user: User): boolean =>
            userIds.some((userId: string) => userId === user.getId());
    }
}
