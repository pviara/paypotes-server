import { Application, Providers } from '@test/helpers/application/application';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { ClassProvider, Provider, ValueProvider } from '@nestjs/common';
import { ContactPostgresTestingRepository } from '@test/helpers/contact/contact.postgres-testing-repository';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Fixture } from '@test/helpers/fixture';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { GroupRepository } from '@groups/persistence/group.repository';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application/model/module';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { RabbitMQServiceSpy } from '@test/doubles/rabbitmq-service.spy';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import { UserRepository } from '@users/persistence/user.repository';

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
    providers: Providers = [],
): Application => {
    return new Application({
        modules: [AuthFakeModule, InfrastructureModule, ...modules],
        providers: [
            {
                provide: ContactRepository,
                useClass: ContactPostgresTestingRepository,
            },
            {
                provide: expenseRepositoryToken,
                useClass: ExpensePostgresTestingRepository,
            },
            {
                provide: GroupRepository,
                useClass: GroupPostgresTestingRepository,
            },
            {
                provide: UserRepository,
                useClass: UserPostgresTestingRepository,
            },
            {
                provide: RabbitMQService,
                useClass: RabbitMQServiceSpy,
            },
            ...providers,
        ],
    });
};

export const initFixtureWith = (
    modules: Modules,
    providers: Providers = [],
): Fixture => {
    const application = initApplicationWith(modules, providers);
    return Fixture.create(application);
};

export const initMessagingApplicationWith = (
    modules: Modules,
    providers: Providers = [],
): Application => {
    return new Application({
        modules: [AuthFakeModule, InfrastructureModule, ...modules],
        providers: [
            ...providers,
            {
                provide: ContactRepository,
                useClass: ContactPostgresTestingRepository,
            },
            {
                provide: expenseRepositoryToken,
                useClass: ExpensePostgresTestingRepository,
            },
            {
                provide: GroupRepository,
                useClass: GroupPostgresTestingRepository,
            },
            {
                provide: UserRepository,
                useClass: UserPostgresTestingRepository,
            },
        ],
    });
};
