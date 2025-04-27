import { ConfigService } from '@nestjs/config';
import { generateRandomUser } from '@test/helpers/user/utils';
import { RabbitMQContactTaskMessenger } from '@infra/task-messengers/contact.task-messenger';
import { RabbitMQProducerSpy } from '@test/doubles/rabbitmq-producer.spy';

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
                    data: {
                        users: [dummyUserA, dummyUserB],
                    },
                },
            });
        });
    });
});
