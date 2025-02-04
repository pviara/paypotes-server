import { ApplicationRunner } from './application-runner';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Type } from '@nestjs/common';

describe('ApplicationRunner', () => {
    let sut: ApplicationRunner;
    let dummyModuleType: Type<DummyModule>;

    let compile: jest.Mock;
    let createNestApplication: jest.Mock;
    let init: jest.Mock;

    let dummyApplication: unknown;

    beforeEach(() => {
        dummyModuleType = DummyModule;
        sut = new ApplicationRunner(dummyModuleType);

        init = jest.fn();
        dummyApplication = { init };

        createNestApplication = jest.fn().mockReturnValue(dummyApplication);
        compile = jest.fn().mockResolvedValue({ createNestApplication });

        jest.spyOn(Test, 'createTestingModule').mockReturnValue({
            compile,
        } as unknown as TestingModuleBuilder);
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
});

class DummyModule {}
