import { generateRandomUsers } from '@test/helpers/user/utils';
import { Group } from '@app/groups/domain/group';
import { GroupModule } from '@groups/group.module';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupInMemoryTestingRepository } from './group.testing-repository';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { Modules } from '@test/helpers/application-runner/model/module';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { User } from '@app/users/domain/user';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
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

export const generateRandomGroup = (options: { members: Array<User> }): Group =>
    new Group({
        id: crypto.randomUUID(),
        name: 'Group',
        emoji: '📅',
        members: options.members,
    });

export const generateRandomGroups = (
    options: RandomArrayGenerationOptions,
): Array<Group> => {
    return Array.from({ length: options.length ?? 4 }).map(
        (_, index) =>
            new Group({
                id: crypto.randomUUID(),
                name: `name_${index}`,
                emoji: '⛺️',
                members: generateRandomUsers(),
            }),
    );
};
