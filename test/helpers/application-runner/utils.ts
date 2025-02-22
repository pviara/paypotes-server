import { ApplicationRunner } from './application-runner';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { Modules } from './model/module';
import { OverridingProviders } from './model/overriding-provider';

export const initRunnerWith = (
    modules: Modules,
    providers: OverridingProviders,
): ApplicationRunner => {
    return new ApplicationRunner({
        modules: [...modules, AuthFakeModule],
        providers,
    });
};
