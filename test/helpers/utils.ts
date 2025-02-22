import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import { INestApplication } from '@nestjs/common';
import { User } from '@users/domain/user';
import { Group } from '@groups/domain/group';
import { App } from 'supertest/types';

type Callback<T> = () => T;
type AsyncCallback<T> = Callback<Promise<T>>;

type RandomArrayGenerationOptions = { length: number };

export const bootstrap = (
    runner: ApplicationRunner,
): AsyncCallback<INestApplication> => {
    return async (): Promise<INestApplication> => await runner.bootstrap();
};

export const shutdown = (runner: ApplicationRunner): AsyncCallback<void> => {
    return async (): Promise<void> => await runner.shutdown();
};

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

export const generateRandomUsers = (): Array<User> => {
    return Array.from({ length: 4 }).map(
        (_, index) =>
            new User({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
            }),
    );
};

export const mapIdsFrom = (users: Array<User>): Array<string> => {
    return users.map((user: User) => user.getId());
};
