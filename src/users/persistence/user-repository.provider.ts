import { Provider } from '@nestjs/common';
import { UserInMemoryRepository } from '@users/persistence/user.repository';

export const userRepositoryToken = 'UserRepositoryToken';

export const userRepositoryProvider: Provider = {
    provide: userRepositoryToken,
    useClass: UserInMemoryRepository,
};
