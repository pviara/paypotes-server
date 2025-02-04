import { INestApplication, Type } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

export class ApplicationRunner {
    constructor(private moduleType: Type) {}

    async bootstrap(): Promise<INestApplication> {
        const moduleBuilder = Test.createTestingModule({
            imports: [this.moduleType],
        });

        const application = await this.createApplicationFrom(moduleBuilder);
        await application.init();

        return application;
    }

    private async createApplicationFrom(
        moduleBuilder: TestingModuleBuilder,
    ): Promise<INestApplication> {
        const module = await moduleBuilder.compile();
        return module.createNestApplication();
    }
}
