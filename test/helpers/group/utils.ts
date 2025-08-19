import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Group } from '@groups/domain/group';
import { GroupModule } from '@groups/group.module';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { Member } from '@groups/domain/member';
import { Modules } from '@test/helpers/application/model/module';
import { Providers } from '@test/helpers/application/application';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export const groupSpecModules: Modules = [GroupModule];
export const groupSpecProviders: Providers = [
    {
        provide: userRepositoryToken,
        useClass: UserPostgresTestingRepository,
    },
    {
        provide: groupRepositoryToken,
        useClass: GroupPostgresTestingRepository,
    },
    {
        provide: expenseRepositoryToken,
        useClass: ExpensePostgresTestingRepository,
    },
];

const getDefaultUserAsMember = (): Member => {
    return Member.fromUser(DEFAULT_USER);
};

export const generateRandomMember = (): Member =>
    new Member({
        id: crypto.randomUUID(),
        firstname: `Firstname`,
        lastname: `Lastname`,
        avatarUrl: 'http://localhost:port/avatar_url',
    });

export const generateRandomMembers = (
    options?: RandomArrayGenerationOptions,
): Array<Member> => {
    return Array.from({ length: options?.length ?? 4 }).map(
        (_, index) =>
            new Member({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
                avatarUrl: 'http://localhost:port/avatar_url',
            }),
    );
};

export const generateDefaultUserRandomGroup = (): Group =>
    new Group({
        id: crypto.randomUUID(),
        name: 'Group',
        emoji: '📅',
        createdAt: new Date(),
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
                createdAt: new Date(
                    `2025-08-08T12:12:${mapSecondsFrom(index)}`,
                ),
                members: [
                    getDefaultUserAsMember(),
                    ...generateRandomMembers({ length: 5 }),
                ],
            }),
    );
};

const mapSecondsFrom = (index: number): string => {
    return index < 10 ? `0${index}` : `${index}`;
};
