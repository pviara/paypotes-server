import { User, Users } from '@users/domain/user';

export interface UserRepository {
    create(user: User): Promise<void>;
    get(...userIds: Array<string>): Promise<Users>;
    getByEmail(email: string): Promise<User | null>;
    getByName(name: string): Promise<Users>;
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

    async getByName(name: string): Promise<Users> {
        const lowercasedName = name.toLowerCase();
        return this.users.filter(this.nameMatches(lowercasedName));
    }

    private userIdFiguresIn(userIds: Array<string>): (user: User) => boolean {
        return (user: User): boolean =>
            userIds.some((userId: string) => userId === user.getId());
    }

    private nameMatches(lowercasedName: string): (value: User) => boolean {
        return (user) =>
            user.getFirstname().toLowerCase().includes(lowercasedName) ||
            user.getLastname().toLowerCase().includes(lowercasedName);
    }
}
