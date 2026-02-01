import { Application, Providers } from '@test/helpers/application/application';
import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { ClassProvider, Provider, ValueProvider } from '@nestjs/common';
import { ContactDatabaseTestingRepository } from '@test/helpers/contact/contact.database-testing-repository';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Fixture } from '@test/helpers/fixture';
import { GroupDatabaseTestingRepository } from '@test/helpers/group/group.database-testing-repository';
import { GroupRepository } from '@groups/persistence/group.repository';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application/model/module';
import { MessageBroker } from '@infra/messaging/rabbitmq.message-broker';
import { MessageBrokerSpy } from '@test/doubles/message-broker.spy';
import { UserDatabaseTestingRepository } from '@test/helpers/user/user.database-testing-repository';
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
                useClass: ContactDatabaseTestingRepository,
            },
            {
                provide: ExpenseRepository,
                useClass: ExpensePostgresTestingRepository,
            },
            {
                provide: GroupRepository,
                useClass: GroupDatabaseTestingRepository,
            },
            {
                provide: UserRepository,
                useClass: UserDatabaseTestingRepository,
            },
            {
                provide: MessageBroker,
                useClass: MessageBrokerSpy,
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
                useClass: ContactDatabaseTestingRepository,
            },
            {
                provide: ExpenseRepository,
                useClass: ExpensePostgresTestingRepository,
            },
            {
                provide: GroupRepository,
                useClass: GroupDatabaseTestingRepository,
            },
            {
                provide: UserRepository,
                useClass: UserDatabaseTestingRepository,
            },
        ],
    });
};
