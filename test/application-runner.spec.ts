import {
    ApplicationNotBootstrappedError,
    ApplicationRunner,
} from './application-runner';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Type } from '@nestjs/common';

describe('ApplicationRunner', () => {
    let sut: ApplicationRunner;
    let dummyModuleType: Type<DummyModule>;

    let close: jest.Mock;
    let compile: jest.Mock;
    let createNestApplication: jest.Mock;
    let init: jest.Mock;

    let dummyApplication: unknown;

    beforeEach(() => {
        mockNestTestingTools();

        dummyModuleType = DummyModule;
        sut = new ApplicationRunner(dummyModuleType);
    });

    describe('bootstrap', () => {
        it('should create a testing module using Nest testing tools', async () => {
            await sut.bootstrap();
            expect(Test.createTestingModule).toHaveBeenCalledTimes(1);
            expect(Test.createTestingModule).toHaveBeenCalledWith({
                imports: [dummyModuleType],
            });
        });

        it('should compile the testing module that was created', async () => {
            await sut.bootstrap();
            expect(compile).toHaveBeenCalledTimes(1);
        });

        it('should initialize the application then return it', async () => {
            const application = await sut.bootstrap();
            expect(init).toHaveBeenCalledTimes(1);
            expect(application).toStrictEqual(dummyApplication);
        });
    });

    describe('shutdown', () => {
        it('should throw an error when no application has been bootstrapped', async () => {
            await expect(sut.shutdown()).rejects.toThrow(
                ApplicationNotBootstrappedError,
            );
        });

        it('should directly call close method from the app that was initialized', async () => {
            await sut.bootstrap();
            await sut.shutdown();
            expect(close).toHaveBeenCalledTimes(1);
        });
    });

    const mockNestTestingTools = (): void => {
        close = jest.fn();
        init = jest.fn();
        dummyApplication = { close, init };

        createNestApplication = jest.fn().mockReturnValue(dummyApplication);
        compile = jest.fn().mockResolvedValue({ createNestApplication });

        jest.spyOn(Test, 'createTestingModule').mockReturnValue({
            compile,
        } as unknown as TestingModuleBuilder);
    };
});

class DummyModule {}
