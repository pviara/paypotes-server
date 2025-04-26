import { Inject } from '@nestjs/common';
import { Producer } from '@infra/rabbitmq/rabbitmq.producer';
import { rabbitMQProducerToken } from '@infra/rabbitmq/rabbitmq.producer.provider';
import { User } from '@users/domain/user';

export interface ContactTaskMessenger {
    sendRelationshipMustBeCreatedBetween(
        userA: User,
        userB: User,
    ): Promise<void>;
}

export class RabbitMQContactTaskMessenger implements ContactTaskMessenger {
    readonly queue = 'contact_tasks';

    constructor(
        @Inject(rabbitMQProducerToken)
        private producer: Producer,
    ) {}

    sendRelationshipMustBeCreatedBetween(
        userA: User,
        userB: User,
    ): Promise<void> {
        return this.producer.send({
            queue: this.queue,
            message: {
                data: {
                    users: [userA, userB],
                },
            },
        });
    }
}
