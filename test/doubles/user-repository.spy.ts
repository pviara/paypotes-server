import { Spy } from '@test/doubles/spy';
import { UserRepository } from '@users/persistence/user.repository';
import { User } from '@users/domain/user';

export class UserRepositorySpy
    extends Spy<UserRepository>
    implements UserRepository
{
    readonly calls = {
        get: {
            count: 0,
            history: [] as string[][],
        },
    };

    async get(...userIds: Array<string>): Promise<User[]> {
        this.calls.get.count++;
        this.calls.get.history.push(userIds);
        return this.getStubOrDefault('get', []);
    }
}
