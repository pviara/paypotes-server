import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Group } from '@groups/domain/group';
import { GroupModule } from '@groups/group.module';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import { Member } from '@groups/domain/member';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

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
    {
        provide: expenseRepositoryToken,
        useClass: ExpenseInMemoryTestingRepository,
    },
];

const getDefaultUserAsMember = (): Member => {
    return Member.fromUser(DEFAULT_USER);
};

export const generateRandomMembers = (
    options?: RandomArrayGenerationOptions,
): Array<Member> => {
    return Array.from({ length: options?.length ?? 4 }).map(
        (_, index) =>
            new Member({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
            }),
    );
};

export const generateDefaultUserRandomGroup = (): Group =>
    new Group({
        id: crypto.randomUUID(),
        name: 'Group',
        emoji: '📅',
        members: [getDefaultUserAsMember(), ...generateRandomMembers()],
    });

export const generateDefaultUserRandomGroups = (
    options: RandomArrayGenerationOptions,
): Array<Group> => {
    return Array.from({ length: options.length ?? 4 }).map(
        (_, index) =>
            new Group({
                id: crypto.randomUUID(),
                name: `name_${index}`,
                emoji: '⛺️',
                members: [getDefaultUserAsMember(), ...generateRandomMembers()],
            }),
    );
};
