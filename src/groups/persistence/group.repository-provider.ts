import { Provider } from '@nestjs/common';
import { GroupPostgresRepository } from '@groups/persistence/group.postgres-repository';

export const groupRepositoryToken = 'GroupRepositoryToken';

export const groupRepositoryProvider: Provider = {
    provide: groupRepositoryToken,
    useClass: GroupPostgresRepository,
};
