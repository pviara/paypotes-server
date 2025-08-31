import { Provider } from '@nestjs/common';
import { UserPostgresRepository } from '@users/persistence/user.postgres-repository';

export const userRepositoryToken = 'UserRepositoryToken';

export const userRepositoryProvider: Provider = {
    provide: userRepositoryToken,
    useClass: UserPostgresRepository,
};
