import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class PaybackGroupExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            expenseId: string;
            debtorIds: Array<string>;
        },
    ) {}
}

@CommandHandler(PaybackGroupExpenseCommand)
export class PaybackGroupExpenseHandler
    implements ICommandHandler<PaybackGroupExpenseCommand>
{
    execute(command: PaybackGroupExpenseCommand): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
