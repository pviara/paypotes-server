import { Provider } from '@nestjs/common';
import { UserPostgresRepository } from '@users/persistence/user.postgres-repository';
import { UserRepository } from '@users/persistence/user.repository';

export const userRepositoryProvider: Provider = {
    provide: UserRepository,
    useClass: UserPostgresRepository,
};
