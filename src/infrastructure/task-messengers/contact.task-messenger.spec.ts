import { RabbitMQContactTaskMessenger } from '@infra/task-messengers/contact.task-messenger';
import { RabbitMQProducerSpy } from '@test/doubles/rabbitmq-producer.spy';
import { RabbitMQServiceSpy } from '@test/doubles/rabbitmq-service.spy';
import { generateRandomUser } from '@test/helpers/user/utils';

describe('RabbitMQContactTaskMessenger', () => {
    let sut: RabbitMQContactTaskMessenger;
    let rabbitMQProducer: RabbitMQProducerSpy;

    beforeEach(() => {
        rabbitMQProducer = new RabbitMQProducerSpy();
        sut = new RabbitMQContactTaskMessenger(rabbitMQProducer);
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
