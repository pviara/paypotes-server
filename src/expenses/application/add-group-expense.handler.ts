import { GroupNotFoundError } from '@groups/application/get-actor-group-by-id.handler';
import { GroupRepository } from '@groups/persistence/group.repository';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Group } from '@groups/domain/group';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { Metadata } from '@expenses/domain/expense';
import { Stakeholder } from '@expenses/domain/stakeholder';

export class AddGroupExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actorId: string;
            id: string;
            label: string;
            emoji: string;
            balance: number;
            groupId: string;
            memberId: string;
        },
    ) {}
}

export class AddGroupExpenseHandler
    implements ICommandHandler<AddGroupExpenseCommand>
{
    constructor(
        private expenseRepo: ExpenseRepository,
        private groupRepo: GroupRepository,
    ) {}

    async execute(command: AddGroupExpenseCommand): Promise<void> {
        const { actorId, groupId } = command.payload;

        const group = await this.groupRepo.getActorGroupById(actorId, groupId);
        if (!group) throw new GroupNotFoundError(groupId);

        const metadata = this.extractMetadataFrom(command);
        const payment = this.extractPaymentFrom(command, group);
        const expense = new GroupExpense(metadata, group, payment);

        return this.expenseRepo.save(expense);
    }

    private extractMetadataFrom(command: AddGroupExpenseCommand): Metadata {
        const { id, label, emoji } = command.payload;
        return { id, label, emoji };
    }

    private extractPaymentFrom(
        command: AddGroupExpenseCommand,
        group: Group,
    ): GroupPayment {
        const { balance, memberId } = command.payload;

        const member = group.getMember(memberId);
        const creditor = Stakeholder.fromMember(member);

        return { balance, creditor };
    }
}
