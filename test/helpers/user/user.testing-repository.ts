import { User } from '@users/domain/user';
import { UserInMemoryRepository } from '@users/persistence/user.repository';

export class UserInMemoryTestingRepository extends UserInMemoryRepository {
    async empty(): Promise<void> {
        this.users = [];
    }

    async insert(...users: Array<User>): Promise<void> {
        this.users.push(...users);
    }
}
