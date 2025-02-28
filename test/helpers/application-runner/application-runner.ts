import { App } from 'supertest/types';
import { ContactInMemoryTestingRepository } from '@test/helpers/contact/contact.testing-repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
    isClassProvider,
    isValueProvider,
    OverridingProvider,
    OverridingProviders,
} from '@test/helpers/application-runner/model/overriding-provider';
import { Modules } from '@test/helpers/application-runner/model/module';
import { Nullable } from '@test/helpers/application-runner/model/nullable';
import { ErrorFilter } from '@app/error-filter';
import { ExpenseInMemoryRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';

type ApplicationRunnerResources = {
    modules: Modules;
    providers?: OverridingProviders;
};

type RepositoryType = 'contact' | 'expense' | 'group' | 'user';
type Repository = {
    [key in RepositoryType]: key extends 'contact'
        ? ContactInMemoryTestingRepository
        : key extends 'expense'
          ? ExpenseInMemoryRepository
          : key extends 'group'
            ? GroupInMemoryTestingRepository
            : key extends 'user'
              ? UserInMemoryTestingRepository
              : never;
};

export class ApplicationRunner {
    private application: Nullable<INestApplication> = null;

    constructor(private resources: ApplicationRunnerResources) {}

    async bootstrap(): Promise<INestApplication> {
        const moduleBuilder = this.createModuleBuilderUsingProviders();
        const application = await this.createApplicationFrom(moduleBuilder);

        this.useDefaultConfigurationFor(application);
        await application.init();

        this.application = application;
        return this.application;
    }

    getApplication(): INestApplication {
        if (this.application) return this.application;
        throw new ApplicationNotBootstrappedError();
    }

    getHttpServer(): App {
        return this.getApplication().getHttpServer();
    }

    getRepository<T extends RepositoryType>(type: T): Repository[T] {
        switch (type) {
            case 'contact':
                return this.getApplication().get(contactRepositoryToken);
            case 'expense':
                return this.getApplication().get(expenseRepositoryToken);
            case 'group':
                return this.getApplication().get(groupRepositoryToken);
            case 'user':
                return this.getApplication().get(userRepositoryToken);
            default:
                throw new Error(`Unknown repository type "${type}"`);
        }
    }

    async shutdown(): Promise<void> {
        await this.getApplication().close();
    }

    private createModuleBuilderUsingProviders(): TestingModuleBuilder {
        const moduleBuilder = Test.createTestingModule({
            imports: this.resources.modules,
        });
        this.overrideProvidersIn(moduleBuilder);

        return moduleBuilder;
    }

    private overrideProvidersIn(moduleBuilder: TestingModuleBuilder): void {
        this.resources.providers?.forEach(
            this.overrideProviderIn(moduleBuilder),
        );
    }

    private overrideProviderIn(
        moduleBuilder: TestingModuleBuilder,
    ): (provider: OverridingProvider) => void {
        return (provider: OverridingProvider) => {
            if (isClassProvider(provider)) {
                moduleBuilder
                    .overrideProvider(provider.provide)
                    .useClass(provider.useClass);
            } else if (isValueProvider(provider)) {
                moduleBuilder
                    .overrideProvider(provider.provide)
                    .useValue(provider.useValue);
            }
        };
    }

    private async createApplicationFrom(
        moduleBuilder: TestingModuleBuilder,
    ): Promise<INestApplication> {
        const module = await moduleBuilder.compile();
        return module.createNestApplication();
    }

    private useDefaultConfigurationFor(application: INestApplication): void {
        application.useGlobalFilters(new ErrorFilter());
        application.useGlobalPipes(new ValidationPipe());
    }
}

export class ApplicationNotBootstrappedError extends Error {
    constructor() {
        super(
            'No application was bootstrapped and thus it cannot be shut down',
        );
    }
}
