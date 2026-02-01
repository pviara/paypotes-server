import { GroupRepository } from '@groups/persistence/group.repository';
import { GroupDatabaseRepository } from '@app/groups/persistence/group.database-repository';
import { Provider } from '@nestjs/common';

export const groupRepositoryProvider: Provider = {
    provide: GroupRepository,
    useClass: GroupDatabaseRepository,
};
