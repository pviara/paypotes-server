import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { Inject } from '@nestjs/common';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class AddRelationshipsBetweenUsersCommand implements ICommand {
    constructor(
        readonly payload: {
            userIds: Array<string>;
        },
    ) {}
}

@CommandHandler(AddRelationshipsBetweenUsersCommand)
export class AddRelationshipsBetweenUsersHandler
    implements ICommandHandler<AddRelationshipsBetweenUsersCommand>
{
    constructor(
        @Inject(contactRepositoryToken)
        private contactRepo: ContactRepository,

        @Inject(userRepositoryToken)
        private userRepo: UserRepository,
    ) {}

    async execute(command: AddRelationshipsBetweenUsersCommand): Promise<void> {
        const { payload } = command;

        console.warn('creating group');

        const users = await this.userRepo.get(...payload.userIds);

        console.warn('users found', users);
        if (users.length < payload.userIds.length) {
            throw new RelationshipUserNotFoundError();
        }

        return this.contactRepo.addRelationshipsBetween(users);
    }
}

export class RelationshipUserNotFoundError extends Error {
    constructor() {
        super(
            'Relationship cannot be added: at least one user could not be found',
        );
    }
}
