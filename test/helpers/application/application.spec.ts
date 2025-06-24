import {
    ApplicationNotBootstrappedError,
    Application,
    Providers,
} from '@test/helpers/application/application';
import { Channel } from 'amqplib';
import { ConfigServiceStub } from '@test/doubles/config-service.stub';
import { ClassProvider, Provider, Type, ValueProvider } from '@nestjs/common';
import { RabbitMQServiceSpy } from '@test/doubles/rabbitmq-service.spy';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

describe('Application', () => {
    let sut: Application;

    let modules: Type<DummyModule>[];

    let close: jest.Mock;
    let compile: jest.Mock;
    let createNestApplication: jest.Mock;
    let init: jest.Mock;
    let get: jest.Mock;
    let overrideProvider: jest.Mock;
    let useClass: jest.Mock;
    let useGlobalFilters: jest.Mock;
    let useGlobalPipes: jest.Mock;
    let useValue: jest.Mock;

    let dummyApplication: Record<string, jest.Mock>;

    beforeEach(() => {
        mockNestTestingTools();

        modules = [DummyModule];
        sut = new Application({ modules });
    });

    describe('bootstrap', () => {
        it('should create a testing module using Nest testing tools', async () => {
            await sut.bootstrap();
            expect(Test.createTestingModule).toHaveBeenCalledTimes(1);
            expect(Test.createTestingModule).toHaveBeenCalledWith({
                imports: modules,
            });
        });

        it('should compile the testing module that was created', async () => {
            await sut.bootstrap();
            expect(compile).toHaveBeenCalledTimes(1);
        });

        it('should use global filters', async () => {
            await sut.bootstrap();
            expect(useGlobalFilters).toHaveBeenCalledTimes(1);
        });

        it('should use global pipes', async () => {
            await sut.bootstrap();
            expect(useGlobalPipes).toHaveBeenCalledTimes(1);
        });

        it('should initialize the application then return it', async () => {
            const application = await sut.bootstrap();
            expect(init).toHaveBeenCalledTimes(1);
            expect(application).toStrictEqual(dummyApplication);
        });

        describe('overriding providers have been given', () => {
            it('should override given provider using a class', async () => {
                const overridingProvider: Provider = {
                    provide: 'dummy_token',
                    useClass: class DummyProviderClass {},
                };
                const providers: Providers = [overridingProvider];

                sut = new Application({ modules, providers });
                await sut.bootstrap();

                expectClassProviderToHaveBeenOverriddenUsing(
                    overridingProvider,
                );
            });

            it('should override given provider using a value', async () => {
                const overridingProvider: Provider = {
                    provide: 'dummy_token',
                    useValue: { prop: 'value' },
                };
                const providers: Providers = [overridingProvider];

                sut = new Application({ modules, providers });
                await sut.bootstrap();

                expectValueProviderToHaveBeenOverriddenUsing(
                    overridingProvider,
                );
            });

            function expectClassProviderToHaveBeenOverriddenUsing(
                provider: ClassProvider,
            ): void {
                expect(overrideProvider).toHaveBeenCalledWith(provider.provide);
                expect(useClass).toHaveBeenCalledWith(provider.useClass);
            }

            function expectValueProviderToHaveBeenOverriddenUsing(
                provider: ValueProvider,
            ): void {
                expect(overrideProvider).toHaveBeenCalledWith(provider.provide);
                expect(useValue).toHaveBeenCalledWith(provider.useValue);
            }
        });
    });

    describe('getApplication', () => {
        it('should throw an error when no application has been bootstrapped', () => {
            expect(() => sut.getApplication()).toThrow(
                ApplicationNotBootstrappedError,
            );
        });

        it('should retrieve application', async () => {
            await sut.bootstrap();

            const application = sut.getApplication();
            expect(application).toStrictEqual(dummyApplication);
        });
    });

    describe('shutdown', () => {
        let configServiceStub: ConfigServiceStub;

        const deleteQueueSpy = { count: 0, history: [] as Array<string> };
        const consumerSpy = {
            deleteQueue: async (queue: string) => {
                deleteQueueSpy.count++;
                deleteQueueSpy.history.push(queue);
                return { messageCount: 0 };
            },
        } as Channel;

        beforeEach(() => {
            configServiceStub = new ConfigServiceStub();
            get.mockReturnValueOnce(configServiceStub);

            const rabbitMQServiceSpy = new RabbitMQServiceSpy();
            rabbitMQServiceSpy.stub('getConsumer', consumerSpy);

            get.mockReturnValueOnce(rabbitMQServiceSpy);
        });

        it('should throw an error when no application has been bootstrapped', async () => {
            await expect(sut.shutdown()).rejects.toThrow(
                ApplicationNotBootstrappedError,
            );
        });

        it('should purge rabbitmqctl queue', async () => {
            await sut.bootstrap();
            await sut.shutdown();

            expect(deleteQueueSpy.count).toBe(1);
            expect(deleteQueueSpy.history).toContain(
                configServiceStub.dummyQueue,
            );
        });

        it('should call close method from the app that was initialized', async () => {
            await sut.bootstrap();
            await sut.shutdown();
            expect(close).toHaveBeenCalledTimes(1);
        });
    });

    const mockNestTestingTools = (): void => {
        close = jest.fn();
        init = jest.fn();
        get = jest.fn();
        useGlobalFilters = jest.fn();
        useGlobalPipes = jest.fn();

        dummyApplication = {
            close,
            get,
            init,
            useGlobalFilters,
            useGlobalPipes,
        };

        createNestApplication = jest.fn().mockReturnValue(dummyApplication);
        compile = jest.fn().mockResolvedValue({ createNestApplication });

        useClass = jest.fn();
        useValue = jest.fn();

        overrideProvider = jest.fn().mockReturnValue({ useClass, useValue });
        jest.spyOn(Test, 'createTestingModule').mockReturnValue({
            compile,
            overrideProvider,
        } as unknown as TestingModuleBuilder);
    };
});

class DummyModule {}
