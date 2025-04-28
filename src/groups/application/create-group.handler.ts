import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactTaskMessenger } from '@infra/task-messengers/contact.task-messenger';
import { contactTaskMessengerToken } from '@infra/task-messengers/contact.task-messenger.provider';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { Member } from '@groups/domain/member';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class CreateGroupCommand implements ICommand {
    constructor(
        readonly payload: {
            id: string;
            name: string;
            emoji: string;
            userIds: Array<string>;
        },
    ) {}
}

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand> {
    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,

        @Inject(userRepositoryToken)
        private userRepository: UserRepository,

        @Inject(contactTaskMessengerToken)
        private messenger: ContactTaskMessenger,
    ) {}

    async execute(command: CreateGroupCommand): Promise<void> {
        const { payload } = command;

        const users = await this.userRepository.get(...payload.userIds);
        if (users.length < payload.userIds.length) {
            throw new GroupUserNotFoundError();
        }

        await this.groupRepository.save(
            new Group({
                id: payload.id,
                name: payload.name,
                emoji: payload.emoji,
                members: this.mapToMembers(users),
            }),
        );

        return this.messenger.sendRelationshipsMustBeCreatedBetween(users);
    }

    private mapToMembers(users: Array<User>): Array<Member> {
        return users.map((user) => Member.fromUser(user));
    }
}

export class GroupUserNotFoundError extends Error {
    constructor() {
        super(`Group cannot be created: at least one user could not be found`);
    }
}
