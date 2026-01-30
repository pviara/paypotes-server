import { AsyncLocalStorage } from 'async_hooks';
import { ConfigService } from '@nestjs/config';
import { Message } from '@infra/contact-task-management/message-content';
import { Injectable } from '@nestjs/common';
import { Log } from '@infra/logger/log.decorator';
import { MessageProducer } from '@infra/rabbitmq/rabbitmq.producer';
import { Store } from '@infra/async-local-storage/store';

export abstract class ContactTaskProducer {
    abstract sendRelationshipMustBeCreatedBetween(
        userIdA: string,
        userIdB: string,
    ): Promise<void>;
    abstract sendRelationshipsMustBeCreatedBetween(
        userIds: Array<string>,
    ): Promise<void>;
}

@Injectable()
export class DefaultContactTaskProducer implements ContactTaskProducer {
    readonly queue = this.configService.getOrThrow<string>(
        'CONTACT_TASKS_QUEUE',
    );

    constructor(
        private als: AsyncLocalStorage<Store>,
        private configService: ConfigService,
        private producer: MessageProducer,
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
