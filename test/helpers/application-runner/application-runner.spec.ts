import {
    ApplicationNotBootstrappedError,
    ApplicationRunner,
    OverriddenType,
    OverridingOptions,
} from '@test/helpers/application-runner/application-runner';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Type } from '@nestjs/common';

describe('ApplicationRunner', () => {
    let sut: ApplicationRunner;
    let dummyModuleType: Type<DummyModule>;

    let close: jest.Mock;
    let compile: jest.Mock;
    let createNestApplication: jest.Mock;
    let init: jest.Mock;
    let overrideProvider: jest.Mock;
    let useClass: jest.Mock;
    let useGlobalFilters: jest.Mock;
    let useGlobalPipes: jest.Mock;

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

        it('should use global application pipes', async () => {
            await sut.bootstrap();
            expect(useGlobalPipes).toHaveBeenCalledTimes(1);
        });

        it('should use global application filters', async () => {
            await sut.bootstrap();
            expect(useGlobalFilters).toHaveBeenCalledTimes(1);
        });

        it('should initialize the application then return it', async () => {
            const application = await sut.bootstrap();
            expect(init).toHaveBeenCalledTimes(1);
            expect(application).toStrictEqual(dummyApplication);
        });

        describe('overriding options have been given', () => {
            it('should override given providers', async () => {
                const dummyOverridingOptions: Array<OverridingOptions> = [
                    {
                        overridingClass: DummyProviderClass,
                        overriddenToken: 'Token',
                        overriddenType: OverriddenType.Provider,
                    },
                    {
                        overridingClass: DummyProviderClass,
                        overriddenToken: 'AnotherToken',
                        overriddenType: OverriddenType.Provider,
                    },
                ];

                sut = new ApplicationRunner(
                    dummyModuleType,
                    dummyOverridingOptions,
                );
                await sut.bootstrap();

                expectProvidersToHaveBeenOverriddenUsing(
                    dummyOverridingOptions,
                );
            });

            class DummyProviderClass {}

            function expectProvidersToHaveBeenOverriddenUsing(
                dummyOverridingOptions: Array<OverridingOptions>,
            ): void {
                expectOverrideProviderMethodToHaveBeenCalledUsing(
                    dummyOverridingOptions,
                );

                expectUseClassMethodToHaveBeenCalledUsing(
                    dummyOverridingOptions,
                );
            }

            function expectOverrideProviderMethodToHaveBeenCalledUsing(
                dummyOverridingOptions: Array<OverridingOptions>,
            ): void {
                expect(overrideProvider).toHaveBeenCalledTimes(
                    dummyOverridingOptions.length,
                );
                dummyOverridingOptions.forEach((options: OverridingOptions) =>
                    expect(overrideProvider).toHaveBeenCalledWith(
                        options.overriddenToken,
                    ),
                );
            }

            function expectUseClassMethodToHaveBeenCalledUsing(
                dummyOverridingOptions: Array<OverridingOptions>,
            ): void {
                expect(useClass).toHaveBeenCalledTimes(
                    dummyOverridingOptions.length,
                );
                dummyOverridingOptions.forEach((options: OverridingOptions) =>
                    expect(useClass).toHaveBeenCalledWith(
                        options.overridingClass,
                    ),
                );
            }
        });
    });

    describe('getApplication', () => {
        it('should throw an error when no application has been bootstrapped', () => {
            expect(() => sut.getApplication()).toThrow(
                ApplicationNotBootstrappedError,
            );
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
        useGlobalFilters = jest.fn();
        useGlobalPipes = jest.fn();

        dummyApplication = { close, init, useGlobalFilters, useGlobalPipes };

        createNestApplication = jest.fn().mockReturnValue(dummyApplication);
        compile = jest.fn().mockResolvedValue({ createNestApplication });

        useClass = jest.fn();
        overrideProvider = jest.fn().mockReturnValue({ useClass });
        jest.spyOn(Test, 'createTestingModule').mockReturnValue({
            compile,
            overrideProvider,
        } as unknown as TestingModuleBuilder);
    };
});

class DummyModule {}
