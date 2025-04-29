import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { MessageType } from '@infra/contact-task-managers/message-content';
import { Producer } from '@infra/rabbitmq/rabbitmq.producer';
import { rabbitMQProducerToken } from '@infra/rabbitmq/rabbitmq.producer.provider';
import { User } from '@users/domain/user';

export interface ContactTaskMessenger {
    sendRelationshipMustBeCreatedBetween(
        userIdA: string,
        userIdB: string,
    ): Promise<void>;
    sendRelationshipsMustBeCreatedBetween(
        userIds: Array<string>,
    ): Promise<void>;
}

export class RabbitMQContactTaskMessenger implements ContactTaskMessenger {
    readonly queue = this.configService.get<string>('CONTACT_TASKS_QUEUE', '');

    constructor(
        private configService: ConfigService,

        @Inject(rabbitMQProducerToken)
        private producer: Producer,
    ) {}

    sendRelationshipMustBeCreatedBetween(
        userIdA: string,
        userIdB: string,
    ): Promise<void> {
        return this.producer.send({
            queue: this.queue,
            message: {
                type: MessageType.PairExpenseCreated,
                userIds: [userIdA, userIdB],
            },
        });
    }

    sendRelationshipsMustBeCreatedBetween(
        userIds: Array<string>,
    ): Promise<void> {
        return this.producer.send({
            queue: this.queue,
            message: {
                type: MessageType.GroupCreated,
                userIds,
            },
        });
    }
}
