import { AddRelationshipsBetweenUsersCommand } from '@contacts/application/tasks/add-relationships-between-users.handler';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Log } from '@infra/logger/log.decorator';
import {
    MessageContent,
    Message,
} from '@infra/contact-task-managers/message-content';

export abstract class ContactTaskHandler {
    abstract on(message: MessageContent): Promise<void>;
}

@Injectable() // -> required for commandBus to be injected
export class DefaultContactTaskHandler implements ContactTaskHandler {
    constructor(private commandBus: CommandBus) {}

    @Log('debug')
    async on(message: MessageContent): Promise<void> {
        switch (message.type) {
            case Message.GroupCreated:
            case Message.PairExpenseCreated: {
                const command = new AddRelationshipsBetweenUsersCommand({
                    userIds: message.userIds,
                });
                return this.commandBus.execute(command);
            }
        }
    }
}
