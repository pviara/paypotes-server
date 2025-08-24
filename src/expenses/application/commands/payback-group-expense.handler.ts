import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';

export class PaybackGroupExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
            expenseId: string;
            debtorIds: Array<string>;
        },
    ) {}
}

@CommandHandler(PaybackGroupExpenseCommand)
export class PaybackGroupExpenseHandler
    implements ICommandHandler<PaybackGroupExpenseCommand>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(command: PaybackGroupExpenseCommand): Promise<void> {
        const { actorId, groupId, expenseId, debtorIds } = command.payload;

        const expense = await this.expenseRepository.getActorGroupExpenseById(
            actorId,
            groupId,
            expenseId,
        );
        if (!expense) throw new ExpenseNotFoundError(expenseId);

        if (expense.hasCreditor(actorId)) {
            const debtors = expense
                .getStakeholders()
                .filter((stakeholder) =>
                    debtorIds.includes(stakeholder.getId()),
                );

            const allDebtorsPaidBack =
                debtors.length === expense.getStakeholders().length - 1;

            allDebtorsPaidBack
                ? expense.settle()
                : expense.settleSharesOf(...debtorIds);
        } else {
            expense.settleShareOf(actorId);
        }

        return this.expenseRepository.updateGroupExpense(expense);
    }
}
