import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { DateService } from '@app/shared/date/date.service';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Group } from '@groups/domain/group';
import {
    GroupExpenseBuilder,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { GroupNotFoundError } from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { GroupRepository } from '@groups/persistence/group.repository';
import { Log } from '@infra/logger/log.decorator';
import { Metadata } from '@expenses/domain/expense/expense';

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

@CommandHandler(AddGroupExpenseCommand)
export class AddGroupExpenseHandler
    implements ICommandHandler<AddGroupExpenseCommand>
{
    constructor(
        private expenseRepository: ExpenseRepository,
        private groupRepository: GroupRepository,
        private dateService: DateService,
    ) {}

    @Log('debug')
    async execute(command: AddGroupExpenseCommand): Promise<void> {
        const { actorId, groupId } = command.payload;

        const group = await this.groupRepository.getActorGroupById(
            actorId,
            groupId,
        );
        if (!group) throw new GroupNotFoundError(groupId);

        const metadata = this.extractMetadataFrom(command);
        const payment = this.extractPaymentFrom(command, group);
        const expense = new GroupExpenseBuilder()
            .withMetadata(metadata)
            .withGroup(group)
            .withPayment(payment)
            .build();

        return this.expenseRepository.saveGroupExpense(expense);
    }

    private extractMetadataFrom(command: AddGroupExpenseCommand): Metadata {
        const { id, label, emoji } = command.payload;
        const createdAt = this.dateService.getCurrentDate();
        return { id, label, emoji, createdAt };
    }

    private extractPaymentFrom(
        command: AddGroupExpenseCommand,
        group: Group,
    ): GroupPayment {
        const { balance, memberId } = command.payload;

        const creditor = group.getMember(memberId);
        return { balance, creditor };
    }
}
