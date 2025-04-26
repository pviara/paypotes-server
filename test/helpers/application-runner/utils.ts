import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { RabbitMQServiceSpy } from '@test/doubles/rabbitmq-service.spy';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export const initRunnerWith = (
    modules: Modules,
    providers: OverridingProviders,
): ApplicationRunner => {
    return new ApplicationRunner({
        modules: [AuthFakeModule, ...modules],
        providers: [
            ...providers,
            {
                provide: rabbitMQServiceToken,
                useClass: RabbitMQServiceSpy,
            },
        ],
    });
};
