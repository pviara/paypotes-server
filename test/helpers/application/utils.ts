import { Application, Providers } from '@test/helpers/application/application';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application/model/module';
import { RabbitMQServiceSpy } from '@test/doubles/rabbitmq-service.spy';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export const initApplicationWith = (
    modules: Modules,
    providers: Providers,
): Application => {
    return new Application({
        modules: [AuthFakeModule, InfrastructureModule, ...modules],
        providers: [
            ...providers,
            {
                provide: rabbitMQServiceToken,
                useClass: RabbitMQServiceSpy,
            },
        ],
    });
};

export const initMessagingApplicationWith = (
    modules: Modules,
    providers: Providers,
): Application => {
    return new Application({
        modules: [AuthFakeModule, InfrastructureModule, ...modules],
        providers,
    });
};
