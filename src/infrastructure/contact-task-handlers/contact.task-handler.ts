import { AddRelationshipsBetweenUsersCommand } from '@app/contacts/application/tasks/add-relationships-between-users.handler';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import {
    MessageContent,
    MessageType,
} from '@infra/contact-task-managers/message-content';

export interface ContactTaskHandler {
    on(message: MessageContent): Promise<void>;
}

@Injectable() // -> required for commandBus to be injected
export class DefaultContactTaskHandler implements ContactTaskHandler {
    constructor(private commandBus: CommandBus) {}

    async on(message: MessageContent): Promise<void> {
        switch (message.type) {
            case MessageType.GroupCreated:
            case MessageType.PairExpenseCreated: {
                const command = new AddRelationshipsBetweenUsersCommand({
                    userIds: message.userIds,
                });
                return this.commandBus.execute(command);
            }
        }
    }
}
