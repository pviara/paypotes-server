import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Group } from '@groups/domain/group';
import { GroupModule } from '@groups/group.module';
import { Member } from '@groups/domain/member';
import { Modules } from '@test/helpers/application/model/module';
import { RandomArrayGenerationOptions } from '@test/helpers/types';

export const groupSpecModules: Modules = [GroupModule];

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

export const generateRandomGroup = (): Group =>
    new Group({
        id: crypto.randomUUID(),
        name: 'Group',
        emoji: '🪩',
        createdAt: new Date(),
        members: generateRandomMembers(),
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
