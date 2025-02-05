import { Provider } from '@nestjs/common';
import { GroupInMemoryRepository } from '@groups/persistence/group.repository';

export const groupRepositoryToken = 'GroupRepositoryToken';

export const groupRepositoryProvider: Provider = {
    provide: groupRepositoryToken,
    useClass: GroupInMemoryRepository,
};
