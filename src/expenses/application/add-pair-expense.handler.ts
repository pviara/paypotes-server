import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Metadata } from '@expenses/domain/expense';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { PairExpense, PairPayment } from '../domain/pair-expense';
import { Stakeholder } from '../domain/stakeholder';
import { ExpenseRepository } from '../persistence/expense.repository';

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

export class AddPairExpenseHandler
    implements ICommandHandler<AddPairExpenseCommand>
{
    constructor(
        private expenseRepo: ExpenseRepository,
        private userRepo: UserRepository,
    ) {}

    async execute(command: AddPairExpenseCommand): Promise<void> {
        const { userId } = command.payload;

        const [stakeholder] = await this.userRepo.get(userId);
        if (!stakeholder) throw new UserExpenseNotFound(userId);

        const metadata = this.extractMetadataFrom(command);
        const payment = this.extractPaymentFrom(command, stakeholder);
        const expense = new PairExpense(metadata, payment);

        return this.expenseRepo.save(expense);
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
                ? Stakeholder.fromUser(actor)
                : Stakeholder.fromUser(user),
            debtor: isCurrentPayer
                ? Stakeholder.fromUser(user)
                : Stakeholder.fromUser(actor),
        };
    }
}

export class UserExpenseNotFound extends Error {
    constructor(stakeholderId: string) {
        super(
            `Pair expense cannot be created: user with id "${stakeholderId} cannot be found"`,
        );
    }
}
