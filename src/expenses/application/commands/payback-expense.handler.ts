import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';

export class PaybackExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            expenseId: string;
        },
    ) {}
}

@CommandHandler(PaybackExpenseCommand)
export class PaybackExpenseHandler
    implements ICommandHandler<PaybackExpenseCommand>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    // todo: there's another use case where the actor says who paid back his share inside of a group
    // todo: that means that we need some "backPayerId" or "memberId" that represents the one who paid back his share
    async execute(command: PaybackExpenseCommand): Promise<void> {
        const { actorId, expenseId } = command.payload;

        const expense = await this.expenseRepository.getActorExpenseById(
            actorId,
            expenseId,
        );

        if (expense) return expense.settleShareOf(actorId);
        throw new ExpenseNotFoundError(expenseId);
    }
}
