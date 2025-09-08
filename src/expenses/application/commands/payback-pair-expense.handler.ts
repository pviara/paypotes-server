import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { Log } from '@infra/logger/log.decorator';

export class PaybackPairExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
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

    @Log('debug')
    async execute(command: PaybackPairExpenseCommand): Promise<void> {
        const { actorId, contactId, expenseId } = command.payload;

        const expense = await this.expenseRepository.getActorContactExpenseById(
            actorId,
            contactId,
            expenseId,
        );
        if (!expense) throw new ExpenseNotFoundError(expenseId);

        expense.settle();

        return this.expenseRepository.updatePairExpense(expense);
    }
}
