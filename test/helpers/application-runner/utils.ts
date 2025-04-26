import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';

export const initRunnerWith = (
    modules: Modules,
    providers: OverridingProviders,
): ApplicationRunner => {
    return new ApplicationRunner({
        modules: [AuthFakeModule, InfrastructureModule, ...modules],
        providers: [
            ...providers,
            // {
            //     provide: rabbitMQServiceToken,
            //     useClass: RabbitMQServiceSpy,
            // },
        ],
    });
};
