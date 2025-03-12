import { ICommand, ICommandHandler } from '@nestjs/cqrs';

export class AddExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            id: string;
            label: string;
            emoji: string;
            stakeholderId: string;
        },
    ) {}
}

export class AddExpenseHandler implements ICommandHandler<AddExpenseCommand> {
    async execute(command: AddExpenseCommand): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
