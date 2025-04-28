import { CommandBus } from '@nestjs/cqrs';

export interface ContactTaskHandler {
    on(message: unknown): Promise<void>;
}

export class DefaultContactTaskHandler implements ContactTaskHandler {
    constructor(private commandBus: CommandBus) {}

    async on(message: unknown): Promise<void> {
        console.log('handling message:', message);
    }
}
