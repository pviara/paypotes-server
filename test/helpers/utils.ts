import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import { INestApplication, Type } from '@nestjs/common';
import {
    OverriddenType,
    OverridingOptions,
} from './application-runner/application-runner';

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

export const createOverridingProviderFrom = (
    token: string,
    classType: Type,
): OverridingOptions => {
    return {
        overridingClass: classType,
        overriddenToken: token,
        overriddenType: OverriddenType.Provider,
    };
};
