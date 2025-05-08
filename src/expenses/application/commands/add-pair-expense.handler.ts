import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { contactTaskMessengerToken } from '@infra/contact-task-managers/contact.task-messenger.provider';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Inject } from '@nestjs/common';
import { Metadata } from '@expenses/domain/expense';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';
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

        @Inject(contactTaskMessengerToken)
        private messenger: ContactTaskMessenger,
    ) {}

    async execute(command: AddPairExpenseCommand): Promise<void> {
        const { actor, userId } = command.payload;

        const [stakeholder] = await this.userRepository.get(userId);
        if (!stakeholder) throw new ExpenseUserNotFoundError(userId);

        const metadata = this.extractMetadataFrom(command);
        const payment = this.extractPaymentFrom(command, stakeholder);
        const expense = new PairExpense(metadata, payment);

        await this.expenseRepository.save(expense);
        return this.messenger.sendRelationshipMustBeCreatedBetween(
            actor.getId(),
            stakeholder.getId(),
        );
    }

    private extractMetadataFrom(command: AddPairExpenseCommand): Metadata {
        const { id, label, emoji } = command.payload;
        return { id, label, emoji };
    }

    private extractPaymentFrom(
        command: AddPairExpenseCommand,
        user: User,
    ): PairPayment {
        const { actor, balance, isCurrentPayer } = command.payload;
        return {
            balance,
            creditor: isCurrentPayer
                ? Stakeholder.from(actor)
                : Stakeholder.from(user),
            debtor: isCurrentPayer
                ? Stakeholder.from(user)
                : Stakeholder.from(actor),
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
