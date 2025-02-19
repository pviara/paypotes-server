import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
    isClassProvider,
    isValueProvider,
    OverridingProvider,
    OverridingProviders,
} from '@test/helpers/application-runner/model/overriding-provider';
import { Modules } from '@test/helpers/application-runner/model/module';
import { Nullable } from '@test/helpers/application-runner/model/nullable';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { ErrorFilter } from '@app/error-filter';

type ApplicationRunnerResources = {
    modules: Modules;
    providers?: OverridingProviders;
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
