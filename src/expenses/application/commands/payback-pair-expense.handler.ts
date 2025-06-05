import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';

export class PaybackPairExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            expenseId: string;
        },
    ) {}
}

@CommandHandler(PaybackPairExpenseCommand)
export class PaybackPairExpenseHandler
    implements ICommandHandler<PaybackPairExpenseCommand>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(command: PaybackPairExpenseCommand): Promise<void> {
        const { actorId, expenseId } = command.payload;

        const expense = await this.expenseRepository.getActorExpenseById(
            actorId,
            expenseId,
        );

        // todo: you have to check if actor is debtor or creditor
        // todo: in other termes you have to payback the debtor's share, not the creditor's share

        if (expense) return expense.settleShareOf(actorId);
        throw new ExpenseNotFoundError(expenseId);
    }
}
