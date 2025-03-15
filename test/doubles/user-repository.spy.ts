import { Spy } from '@test/helpers/spy';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';

export class UserRepositorySpy
    extends Spy<UserRepository>
    implements UserRepository
{
    readonly calls = {
        create: {
            count: 0,
            history: [] as Array<User>,
        },
        get: {
            count: 0,
            history: [] as Array<string[]>,
        },
        getByEmail: {
            count: 0,
            history: [] as Array<string>,
        },
        getByPhone: {
            count: 0,
            history: [] as Array<string>,
        },
    };

    async create(user: User): Promise<void> {
        this.calls.create.count++;
        this.calls.create.history.push(user);
        return this.getStubOrDefault('create', undefined);
    }

    async get(...userIds: Array<string>): Promise<User[]> {
        this.calls.get.count++;
        this.calls.get.history.push(userIds);
        return this.getStubOrDefault('get', []);
    }

    async getByEmail(email: string): Promise<User | null> {
        this.calls.getByEmail.count++;
        this.calls.getByEmail.history.push(email);
        return this.getStubOrDefault('getByEmail', null);
    }

    async getByPhone(phone: string): Promise<User | null> {
        this.calls.getByPhone.count++;
        this.calls.getByPhone.history.push(phone);
        return this.getStubOrDefault('getByPhone', null);
    }
}
