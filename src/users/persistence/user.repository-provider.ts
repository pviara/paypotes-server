import { Provider } from '@nestjs/common';
import { UserDatabaseRepository } from '@app/users/persistence/user.database-repository';
import { UserRepository } from '@users/persistence/user.repository';

export const userRepositoryProvider: Provider = {
    provide: UserRepository,
    useClass: UserDatabaseRepository,
};
