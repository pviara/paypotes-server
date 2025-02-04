import { INestApplication, Type } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

type Nullable<T> = T | null;

export class ApplicationRunner {
    private application: Nullable<INestApplication> = null;

    constructor(private moduleType: Type) {}

    async bootstrap(): Promise<INestApplication> {
        const moduleBuilder = Test.createTestingModule({
            imports: [this.moduleType],
        });

        const application = await this.createApplicationFrom(moduleBuilder);
        await application.init();

        this.application = application;
        return this.application;
    }

    shutdown(): Promise<void> {
        if (this.application) return this.application.close();
        throw new ApplicationNotBootstrappedError();
    }

    private async createApplicationFrom(
        moduleBuilder: TestingModuleBuilder,
    ): Promise<INestApplication> {
        const module = await moduleBuilder.compile();
        return module.createNestApplication();
    }
}

export class ApplicationNotBootstrappedError extends Error {
    constructor() {
        super(
            'No application was bootstrapped and thus it cannot be shut down',
        );
    }
}
