import { CommandBus } from '@nestjs/cqrs';
import {
    MessageContent,
    MessageType,
} from '@infra/contact-task-managers/message-content';

export interface ContactTaskHandler {
    on(message: MessageContent): Promise<void>;
}

export class DefaultContactTaskHandler implements ContactTaskHandler {
    constructor(private commandBus: CommandBus) {}

    async on(message: MessageContent): Promise<void> {
        switch (message.type) {
            case MessageType.GroupCreated: {
                message.users;
                return;
            }

            case MessageType.PairExpenseCreated: {
                message.users;
                return;
            }
        }
    }
}
