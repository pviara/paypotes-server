import { GroupModule } from '@groups/group.module';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupInMemoryTestingRepository } from './group.testing-repository';
import { OverridingProviders } from '../application-runner/model/overriding-provider';
import { Modules } from '../application-runner/model/module';
import { UserInMemoryTestingRepository } from '../user/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';

export const groupSpecModules: Modules = [GroupModule];
export const groupSpecProviders: OverridingProviders = [
    {
        provide: userRepositoryToken,
        useClass: UserInMemoryTestingRepository,
    },
    {
        provide: groupRepositoryToken,
        useClass: GroupInMemoryTestingRepository,
    },
];
