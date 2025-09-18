import { AsyncLocalStorage } from 'async_hooks';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { Message } from '@infra/contact-task-managers/message-content';
import { Producer } from '@infra/rabbitmq/rabbitmq.producer';
import { rabbitMQProducerToken } from '@infra/rabbitmq/rabbitmq.producer.provider';
import { Log } from '../logger/log.decorator';

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
        private als: AsyncLocalStorage<any>,
        private configService: ConfigService,

        @Inject(rabbitMQProducerToken)
        private producer: Producer,
    ) {}

    @Log('debug')
    sendRelationshipMustBeCreatedBetween(
        userIdA: string,
        userIdB: string,
    ): Promise<void> {
        const correlationId = this.extractCorrelationIdFromStore();
        return this.producer.send({
            queue: this.queue,
            message: {
                type: Message.PairExpenseCreated,
                correlationId,
                userIds: [userIdA, userIdB],
            },
        });
    }

    @Log('debug')
    sendRelationshipsMustBeCreatedBetween(
        userIds: Array<string>,
    ): Promise<void> {
        const correlationId = this.extractCorrelationIdFromStore();
        return this.producer.send({
            queue: this.queue,
            message: {
                type: Message.GroupCreated,
                correlationId,
                userIds,
            },
        });
    }

    private extractCorrelationIdFromStore(): string {
        return this.als.getStore()?.['x-correlation-id'] ?? '';
    }
}
