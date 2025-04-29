import { ConfigService } from '@nestjs/config';
import { generateRandomUser } from '@test/helpers/user/utils';
import { RabbitMQContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { RabbitMQProducerSpy } from '@test/doubles/rabbitmq-producer.spy';
import { MessageType } from './message-content';

describe('RabbitMQContactTaskMessenger', () => {
    let sut: RabbitMQContactTaskMessenger;

    let rabbitMQProducer: RabbitMQProducerSpy;
    let configService: ConfigService;

    beforeEach(() => {
        rabbitMQProducer = new RabbitMQProducerSpy();
        configService = new ConfigService();
        sut = new RabbitMQContactTaskMessenger(configService, rabbitMQProducer);
    });

    describe('sendRelationshipMustBeCreatedBetween', () => {
        it('should send given message on the appropriate topic', async () => {
            const [dummyUserA, dummyUserB] = [
                generateRandomUser(),
                generateRandomUser(),
            ];

            await sut.sendRelationshipMustBeCreatedBetween(
                dummyUserA,
                dummyUserB,
            );

            expect(rabbitMQProducer.calls.send.count).toBe(1);
            expect(rabbitMQProducer.calls.send.history).toContainEqual({
                queue: sut.queue,
                message: {
                    type: MessageType.PairExpenseCreated,
                    users: [dummyUserA, dummyUserB],
                },
            });
        });
    });

    describe('sendRelationshipsMustBeCreatedBetween', () => {
        it('should send given message on the appropriate topic', async () => {
            const users = Array.from({ length: 5 }).map(() =>
                generateRandomUser(),
            );

            await sut.sendRelationshipsMustBeCreatedBetween(users);

            expect(rabbitMQProducer.calls.send.count).toBe(1);
            expect(rabbitMQProducer.calls.send.history).toContainEqual({
                queue: sut.queue,
                message: {
                    type: MessageType.GroupCreated,
                    users,
                },
            });
        });
    });
});
