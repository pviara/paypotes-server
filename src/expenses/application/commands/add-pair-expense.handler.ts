import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { contactTaskMessengerToken } from '@infra/contact-task-managers/contact.task-messenger.provider';
import { DateService } from '@app/shared/date/date.service';
import { dateServiceProviderToken } from '@app/shared/date/date.service.provider';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { Log } from '@infra/logger/log.decorator';
import { Metadata } from '@expenses/domain/expense/expense';
import {
    PairExpense,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class AddPairExpenseCommand implements ICommand {
    constructor(
        readonly payload: {
            actor: User;
            id: string;
            label: string;
            emoji: string;
            balance: number;
            isCurrentPayer: boolean;
            userId: string;
        },
    ) {}
}

@CommandHandler(AddPairExpenseCommand)
export class AddPairExpenseHandler
    implements ICommandHandler<AddPairExpenseCommand>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,

        @Inject(userRepositoryToken)
        private userRepository: UserRepository,

        @Inject(dateServiceProviderToken)
        private dateService: DateService,

        @Inject(contactTaskMessengerToken)
        private messenger: ContactTaskMessenger,
    ) {}

    @Log('debug')
    async execute(command: AddPairExpenseCommand): Promise<void> {
        const { actor, userId } = command.payload;

        const [stakeholder] = await this.userRepository.get(userId);
        if (!stakeholder) throw new ExpenseUserNotFoundError(userId);

        const metadata = this.extractMetadataFrom(command);
        const payment = this.extractPaymentFrom(command, stakeholder);
        const expense = PairExpense.create(metadata, payment);

        await this.expenseRepository.savePairExpense(expense);
        return this.messenger.sendRelationshipMustBeCreatedBetween(
            actor.getId(),
            stakeholder.getId(),
        );
    }

    private extractMetadataFrom(command: AddPairExpenseCommand): Metadata {
        const { id, label, emoji } = command.payload;
        const createdAt = this.dateService.getCurrentDate();
        return {
            id,
            label,
            emoji,
            createdAt,
        };
    }

    private extractPaymentFrom(
        command: AddPairExpenseCommand,
        user: User,
    ): PairPayment {
        const { actor, balance, isCurrentPayer } = command.payload;
        return {
            balance,
            creditor: isCurrentPayer ? actor : user,
            debtor: isCurrentPayer ? user : actor,
        };
    }
}

export class ExpenseUserNotFoundError extends Error {
    constructor(stakeholderId: string) {
        super(
            `Pair expense cannot be created: user with id "${stakeholderId} cannot be found"`,
        );
    }
}
