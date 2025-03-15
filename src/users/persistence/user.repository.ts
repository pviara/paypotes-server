import { User } from '@users/domain/user';

export interface UserRepository {
    get(...userIds: Array<string>): Promise<User[]>;
    getByPhone(phone: string): Promise<User | null>;
}

export class UserInMemoryRepository {
    protected users: Array<User> = [];

    async get(...userIds: Array<string>): Promise<User[]> {
        const users = this.users.filter(this.userIdFiguresIn(userIds));
        return users;
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
