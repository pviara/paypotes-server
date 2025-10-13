import { App } from 'supertest/types';
import { AuthFakeGuard } from '@test/doubles/auth/auth.fake-guard';
import { ConfigService } from '@nestjs/config';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { ErrorFilter } from '@app/error-filter';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import {
    isClassProvider,
    isValueProvider,
} from '@test/helpers/application/utils';
import { INestApplication, Provider, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt.auth-guard';
import { Modules } from '@test/helpers/application/model/module';
import { Nullable } from '@app/shared/nullable';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';
import { Repositories, RepositoryType } from './model/repositories';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

type ApplicationResources = {
    modules: Modules;
    providers?: Providers;
};

export type Providers = Array<Provider>;

export class Application {
    private application: Nullable<INestApplication> = null;

    constructor(private resources: ApplicationResources) {}

    async bootstrap(): Promise<INestApplication> {
        const moduleBuilder = this.createModuleBuilderUsingProviders();
        const application = await this.createApplicationFrom(moduleBuilder);

        this.useDefaultConfigurationFor(application);
        await application.init();

        this.application = application;
        return this.application;
    }

    async emptyDatabase(): Promise<void> {
        const { contactRepo, expenseRepo, groupRepo, userRepo } =
            this.getRepositories();

        await expenseRepo.empty();
        await contactRepo.empty();
        await groupRepo.empty();
        await userRepo.empty();
    }

    getApplication(): INestApplication {
        if (this.application) return this.application;
        throw new ApplicationNotBootstrappedError();
    }

    getRepositories(): Repositories {
        return {
            contactRepo: this.getRepository('contactRepo'),
            expenseRepo: this.getRepository('expenseRepo'),
            groupRepo: this.getRepository('groupRepo'),
            userRepo: this.getRepository('userRepo'),
        };
    }

    getHttpServer(): App {
        return this.getApplication().getHttpServer();
    }

    async shutdown(): Promise<void> {
        await this.tryDeletingRabbitMQSingleQueue();
        await this.getApplication().close();
    }

    private createModuleBuilderUsingProviders(): TestingModuleBuilder {
        const moduleBuilder = Test.createTestingModule({
            imports: this.resources.modules,
        });
        this.overrideAuthGuardIn(moduleBuilder);
        this.overrideProvidersIn(moduleBuilder);

        return moduleBuilder;
    }

    private overrideAuthGuardIn(moduleBuilder: TestingModuleBuilder): void {
        moduleBuilder.overrideGuard(JwtAuthGuard).useClass(AuthFakeGuard);
    }

    private overrideProvidersIn(moduleBuilder: TestingModuleBuilder): void {
        this.resources.providers?.forEach(
            this.overrideProviderIn(moduleBuilder),
        );
    }

    private overrideProviderIn(
        moduleBuilder: TestingModuleBuilder,
    ): (provider: Provider) => void {
        return (provider: Provider) => {
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

    private getRepository<T extends RepositoryType>(type: T): Repositories[T] {
        switch (type) {
            case 'contactRepo':
                return this.getApplication().get(ContactRepository);
            case 'expenseRepo':
                return this.getApplication().get(expenseRepositoryToken);
            case 'groupRepo':
                return this.getApplication().get(groupRepositoryToken);
            case 'userRepo':
                return this.getApplication().get(userRepositoryToken);
            default:
                throw new Error(`Unknown repository type "${type}"`);
        }
    }

    private async tryDeletingRabbitMQSingleQueue(): Promise<void> {
        try {
            const configService = this.getApplication().get(ConfigService);
            const rabbitmqService =
                this.getApplication().get<RabbitMQService>(
                    rabbitMQServiceToken,
                );

            const queue = configService.getOrThrow('CONTACT_TASKS_QUEUE');
            await rabbitmqService.getConsumer().deleteQueue(queue);
        } catch (error: unknown) {}
    }
}

export class ApplicationNotBootstrappedError extends Error {
    constructor() {
        super(
            'No application was bootstrapped and thus it cannot be shut down',
        );
    }
}
