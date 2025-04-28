import { CommandBus } from '@nestjs/cqrs';
import { MessageContent } from '@infra/contact-task-managers/message-content';

export interface ContactTaskHandler {
    on(message: MessageContent): Promise<void>;
}

export class DefaultContactTaskHandler implements ContactTaskHandler {
    constructor(private commandBus: CommandBus) {}

    async on(message: MessageContent): Promise<void> {
        console.log('handling message:', message);
    }
}
