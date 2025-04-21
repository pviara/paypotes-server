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
        getByName: {
            count: 0,
            history: [] as Array<string>,
        },
        getByPhone: {
            count: 0,
            history: [] as Array<string>,
        },
    };

    async create(user: User): Promise<void> {
        this.saveCall('create', user);
        return this.getStubOrDefault('create', undefined);
    }

    async get(...userIds: Array<string>): Promise<User[]> {
        this.saveCall('get', userIds);
        return this.getStubOrDefault('get', []);
    }

    async getByEmail(email: string): Promise<User | null> {
        this.saveCall('getByEmail', email);
        return this.getStubOrDefault('getByEmail', null);
    }

    async getByName(name: string): Promise<User | null> {
        this.saveCall('getByName', name);
        return this.getStubOrDefault('getByName', null);
    }

    async getByPhone(phone: string): Promise<User | null> {
        this.saveCall('getByPhone', phone);
        return this.getStubOrDefault('getByPhone', null);
    }
}
