import { Spy } from '@test/helpers/spy';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';

export class UserRepositorySpy
    extends Spy<UserRepository>
    implements UserRepository
{
    readonly calls = {
        get: {
            count: 0,
            history: [] as Array<string[]>,
        },
        getByPhone: {
            count: 0,
            history: [] as Array<string>,
        },
    };

    async get(...userIds: Array<string>): Promise<User[]> {
        this.calls.get.count++;
        this.calls.get.history.push(userIds);
        return this.getStubOrDefault('get', []);
    }

    async getByPhone(phone: string): Promise<User | null> {
        this.calls.getByPhone.count++;
        this.calls.getByPhone.history.push(phone);
        return this.getStubOrDefault('getByPhone', null);
    }
}
