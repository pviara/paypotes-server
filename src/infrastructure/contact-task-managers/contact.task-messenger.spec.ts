import { AsyncLocalStorage } from 'async_hooks';
import { ConfigService } from '@nestjs/config';
import { MessageType } from '@infra/contact-task-managers/message-content';
import { RabbitMQContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { RabbitMQProducerSpy } from '@test/doubles/rabbitmq-producer.spy';

describe('RabbitMQContactTaskMessenger', () => {
    let sut: RabbitMQContactTaskMessenger;

    let asyncLocalStorage: AsyncLocalStorage<unknown>;
    let rabbitMQProducer: RabbitMQProducerSpy;
    let configService: ConfigService;

    const dummyCorrelationId = crypto.randomUUID();

    beforeEach(() => {
        initSut();
        asyncLocalStorage.getStore = () => ({
            'x-correlation-id': dummyCorrelationId,
        });
    });

    describe('sendRelationshipMustBeCreatedBetween', () => {
        it('should send given message on the appropriate topic', async () => {
            const [dummyUserIdA, dummyUserIdB] = [
                crypto.randomUUID(),
                crypto.randomUUID(),
            ];

            await sut.sendRelationshipMustBeCreatedBetween(
                dummyUserIdA,
                dummyUserIdB,
            );

            expect(rabbitMQProducer.calls.send.count).toBe(1);
            expect(rabbitMQProducer.calls.send.history).toContainEqual({
                queue: sut.queue,
                message: {
                    type: MessageType.PairExpenseCreated,
                    correlationId: dummyCorrelationId,
                    userIds: [dummyUserIdA, dummyUserIdB],
                },
            });
        });
    });

    describe('sendRelationshipsMustBeCreatedBetween', () => {
        it('should send given message on the appropriate topic', async () => {
            const userIds = Array.from({ length: 5 }).map(() =>
                crypto.randomUUID(),
            );

            await sut.sendRelationshipsMustBeCreatedBetween(userIds);

            expect(rabbitMQProducer.calls.send.count).toBe(1);
            expect(rabbitMQProducer.calls.send.history).toContainEqual({
                queue: sut.queue,
                message: {
                    type: MessageType.GroupCreated,
                    correlationId: dummyCorrelationId,
                    userIds,
                },
            });
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new RabbitMQContactTaskMessenger(
            asyncLocalStorage,
            configService,
            rabbitMQProducer,
        );
    }

    function initDependencies(): void {
        asyncLocalStorage = new AsyncLocalStorage();
        rabbitMQProducer = new RabbitMQProducerSpy();
        configService = new ConfigService();
    }
});
