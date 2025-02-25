import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import { AsyncCallback } from '@test/helpers/types';
import { INestApplication } from '@nestjs/common';
import { User } from '@users/domain/user';

export const bootstrap = (
    runner: ApplicationRunner,
): AsyncCallback<INestApplication> => {
    return async (): Promise<INestApplication> => await runner.bootstrap();
};

export const shutdown = (runner: ApplicationRunner): AsyncCallback<void> => {
    return async (): Promise<void> => await runner.shutdown();
};

export const mapIdsFrom = (users: Array<User>): Array<string> => {
    return users.map((user: User) => user.getId());
};
