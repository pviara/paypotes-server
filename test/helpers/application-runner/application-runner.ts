import {
    INestApplication,
    InjectionToken,
    Type,
    ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { ErrorFilter } from '@app/error-filter';
import { UserTestingRepository } from '../user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupTestingRepository } from '../group.testing-repository';

type Nullable<T> = T | null;

export enum OverriddenType {
    Provider,
}

type ProviderOverrideOptions = {
    overridingClass: Type;
    overriddenToken: InjectionToken;
    overriddenType: OverriddenType.Provider;
};

export type OverridingOptions = ProviderOverrideOptions;

export class ApplicationRunner {
    private application: Nullable<INestApplication> = null;

    constructor(
        private moduleType: Type,
        private overridingOptions: Array<OverridingOptions> = [],
    ) {}

    async bootstrap(): Promise<INestApplication> {
        const moduleBuilder = Test.createTestingModule({
            imports: [this.moduleType],
        });
        this.overrideTypesIn(moduleBuilder);

        const application = await this.createApplicationFrom(moduleBuilder);
        application.useGlobalPipes(new ValidationPipe());
        application.useGlobalFilters(new ErrorFilter());

        await application.init();

        this.application = application;
        return this.application;
    }

    getApplication(): INestApplication {
        if (this.application) return this.application;
        throw new ApplicationNotBootstrappedError();
    }

    getGroupRepository(): GroupTestingRepository {
        if (this.application) {
            return this.getApplication().get(groupRepositoryToken);
        }
        throw new ApplicationNotBootstrappedError();
    }

    getUserRepository(): UserTestingRepository {
        if (this.application) {
            return this.getApplication().get(userRepositoryToken);
        }
        throw new ApplicationNotBootstrappedError();
    }

    async shutdown(): Promise<void> {
        if (this.application) await this.application.close();
        else throw new ApplicationNotBootstrappedError();
    }

    private async createApplicationFrom(
        moduleBuilder: TestingModuleBuilder,
    ): Promise<INestApplication> {
        const module = await moduleBuilder.compile();
        return module.createNestApplication();
    }

    private overrideTypesIn(moduleBuilder: TestingModuleBuilder): void {
        if (this.hasOverridingBeenPlanned()) {
            this.overridingOptions.forEach(this.overrideTypeIn(moduleBuilder));
        }
    }

    private overrideTypeIn(
        moduleBuilder: TestingModuleBuilder,
    ): (options: OverridingOptions) => void {
        return (options: OverridingOptions): void => {
            switch (options.overriddenType) {
                case OverriddenType.Provider: {
                    moduleBuilder
                        .overrideProvider(options.overriddenToken)
                        .useClass(options.overridingClass);
                    break;
                }
            }
        };
    }

    private hasOverridingBeenPlanned(): boolean {
        return this.overridingOptions.length > 0;
    }
}

export class ApplicationNotBootstrappedError extends Error {
    constructor() {
        super(
            'No application was bootstrapped and thus it cannot be shut down',
        );
    }
}
