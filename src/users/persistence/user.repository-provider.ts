import { Provider } from '@nestjs/common';
import { UserInMemoryRepository } from '@users/persistence/user.repository';

export const UserRepositoryToken = 'UserRepositoryToken';
export const UserRepositoryProvider: Provider = {
    provide: UserRepositoryToken,
    useClass: UserInMemoryRepository,
};
