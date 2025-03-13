import { ExpenseNotFoundError } from '@expenses/application/get-actor-expense-by-id.handler';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';

export class PaybackExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            expenseId: string;
        },
    ) {}
}

export class PaybackExpenseHandler
    implements ICommandHandler<PaybackExpenseCommand>
{
    constructor(private expenseRepo: ExpenseRepository) {}

    async execute(command: PaybackExpenseCommand): Promise<void> {
        const { actorId, expenseId } = command.payload;

        const expense = await this.expenseRepo.getActorExpenseById(
            actorId,
            expenseId,
        );

        if (expense) return this.expenseRepo.delete(expense.getId());
        throw new ExpenseNotFoundError(expenseId);
    }
}
