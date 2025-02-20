import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';

export interface UserTestingRepository extends UserRepository {
    empty(): Promise<void>;
    insert(...users: Array<User>): Promise<void>;
}

export class UserInMemoryTestingRepository implements UserTestingRepository {
    private users: Array<User> = [];

    empty(): Promise<void> {
        this.users = [];
        return Promise.resolve();
    }

    get(...userIds: Array<string>): Promise<User[]> {
        const users = this.users.filter(this.userIdFiguresIn(userIds));
        return Promise.resolve(users);
    }

    insert(...users: Array<User>): Promise<void> {
        this.users.push(...users);
        return Promise.resolve();
    }

    private userIdFiguresIn(userIds: Array<string>): (user: User) => boolean {
        return (user: User): boolean =>
            userIds.some((userId: string) => userId === user.getId());
    }
}
