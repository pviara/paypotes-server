import { User } from '@users/domain/user';

export interface UserRepository {
    get(...userIds: Array<string>): Promise<User[]>;
}

export class UserInMemoryRepository {
    protected users: Array<User> = [];

    async get(...userIds: Array<string>): Promise<User[]> {
        const users = this.users.filter(this.userIdFiguresIn(userIds));
        return users;
    }

    private userIdFiguresIn(userIds: Array<string>): (user: User) => boolean {
        return (user: User): boolean =>
            userIds.some((userId: string) => userId === user.getId());
    }
}
