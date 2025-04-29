import { ContactRepository } from '@app/contacts/persistence/contact.repository';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '@app/users/persistence/user.repository';
import { User } from '@app/users/domain/user';

export class AddRelationshipBetweenUsersCommand implements ICommand {
    constructor(
        readonly payload: {
            userIds: [string, string];
        },
    ) {}
}

export class AddRelationshipBetweenUsersHandler
    implements ICommandHandler<AddRelationshipBetweenUsersCommand>
{
    constructor(
        private contactRepo: ContactRepository,
        private userRepo: UserRepository,
    ) {}

    async execute(command: AddRelationshipBetweenUsersCommand): Promise<void> {
        const { payload } = command;

        const users = await this.userRepo.get(...payload.userIds);
        if (users.length < payload.userIds.length) {
            throw new RelationshipUserNotFoundError();
        }

        const userIds = this.mapIdsFrom(users);
        return this.contactRepo.addRelationshipBetween(userIds);
    }

    private mapIdsFrom(users: Array<User>): Array<string> {
        return users.map((user) => user.getId());
    }
}

export class RelationshipUserNotFoundError extends Error {
    constructor() {
        super(
            'Relationship cannot be added: at least one user could not be found',
        );
    }
}
