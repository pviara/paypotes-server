import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import { INestApplication } from '@nestjs/common';

type Callback<T> = () => T;
type AsyncCallback<T> = Callback<Promise<T>>;

export const bootstrap = (
    runner: ApplicationRunner,
): AsyncCallback<INestApplication> => {
    return async (): Promise<INestApplication> => await runner.bootstrap();
};

export const shutdown = (runner: ApplicationRunner): AsyncCallback<void> => {
    return async (): Promise<void> => await runner.shutdown();
};
