import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { Member } from '@groups/domain/member';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';

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
    ) {}

    async execute(command: CreateGroupCommand): Promise<void> {
        const { payload } = command;

        const users = await this.userRepository.get(...payload.userIds);
        if (users.length < payload.userIds.length) {
            throw new UserNotFoundError();
        }

        return this.groupRepository.save(
            new Group({
                id: payload.id,
                name: payload.name,
                emoji: payload.emoji,
                members: this.mapToMembers(users),
            }),
        );

        // todo: publish event to create a relationship between each group member
    }

    private mapToMembers(users: Array<User>): Array<Member> {
        return users.map((user) => Member.fromUser(user));
    }
}

export class UserNotFoundError extends Error {
    constructor() {
        super(`Group cannot be created: at least one user could not be found`);
    }
}
