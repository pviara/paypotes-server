import { GroupRepository } from '@groups/persistence/group.repository';
import { GroupPostgresRepository } from '@groups/persistence/group.postgres-repository';
import { Provider } from '@nestjs/common';

export const groupRepositoryProvider: Provider = {
    provide: GroupRepository,
    useClass: GroupPostgresRepository,
};
