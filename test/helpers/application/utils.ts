import { Application, Providers } from '@test/helpers/application/application';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { ClassProvider, Provider, ValueProvider } from '@nestjs/common';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application/model/module';
import { RabbitMQServiceSpy } from '@test/doubles/rabbitmq-service.spy';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export const isClassProvider = (
    provider: Provider,
): provider is ClassProvider => {
    return provider.hasOwnProperty('useClass');
};

export const isValueProvider = (
    provider: Provider,
): provider is ValueProvider => {
    return provider.hasOwnProperty('useValue');
};

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
