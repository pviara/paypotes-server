import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { UserRepository } from '@users/persistence/user.repository';
import { Inject } from '@nestjs/common';
import { User } from '@users/domain/user';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class AddRelationshipBetweenUsersCommand implements ICommand {
    constructor(
        readonly payload: {
            userIds: [string, string];
        },
    ) {}
}

@CommandHandler(AddRelationshipBetweenUsersCommand)
export class AddRelationshipBetweenUsersHandler
    implements ICommandHandler<AddRelationshipBetweenUsersCommand>
{
    constructor(
        @Inject(contactRepositoryToken)
        private contactRepo: ContactRepository,

        @Inject(userRepositoryToken)
        private userRepo: UserRepository,
    ) {}

    async execute(command: AddRelationshipBetweenUsersCommand): Promise<void> {
        const { payload } = command;

        const users = await this.userRepo.get(...payload.userIds);
        if (users.length < payload.userIds.length) {
            throw new RelationshipUserNotFoundError();
        }

        return this.contactRepo.addRelationshipBetween(users);
    }
}

export class RelationshipUserNotFoundError extends Error {
    constructor() {
        super(
            'Relationship cannot be added: at least one user could not be found',
        );
    }
}
