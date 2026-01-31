import { AsyncLocalStorage } from 'async_hooks';
import { ConfigService } from '@nestjs/config';
import { Message } from '@infra/contact-task-messaging/message-content';
import { DefaultContactTaskProducer } from '@app/infrastructure/contact-task-messaging/producer/contact.task-producer';
import { MessageProducerSpy } from '@test/doubles/message-producer.spy';
import { Store } from '@infra/async-local-storage/store';

describe('RabbitMQContactTaskProducer', () => {
    let sut: DefaultContactTaskProducer;

    let asyncLocalStorage: AsyncLocalStorage<Store>;
    let messageProducer: MessageProducerSpy;
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

            expect(messageProducer.calls.send.count).toBe(1);
            expect(messageProducer.calls.send.history).toContainEqual({
                queue: sut.queue,
                message: {
                    type: Message.PairExpenseCreated,
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

            expect(messageProducer.calls.send.count).toBe(1);
            expect(messageProducer.calls.send.history).toContainEqual({
                queue: sut.queue,
                message: {
                    type: Message.GroupCreated,
                    correlationId: dummyCorrelationId,
                    userIds,
                },
            });
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new DefaultContactTaskProducer(
            asyncLocalStorage,
            configService,
            messageProducer,
        );
    }

    function initDependencies(): void {
        asyncLocalStorage = new AsyncLocalStorage();
        messageProducer = new MessageProducerSpy();
        configService = new ConfigService();
    }
});
