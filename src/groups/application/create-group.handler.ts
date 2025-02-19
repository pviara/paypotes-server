import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
    CreateGroup,
    GroupRepository,
} from '@groups/persistence/group.repository';
import { Group } from '@groups/domain/group';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';
import { User } from '@users/domain/user';

export class CreateGroupCommand implements ICommand {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly emoji: string,
        readonly memberIds: Array<string>,
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
        const users = await this.userRepository.get(...command.memberIds);
        if (users.length < command.memberIds.length) {
            throw new MemberNotFoundError();
        }

        const group = this.buildGroupFrom(command, users);
        return this.groupRepository.save(group);
    }

    private buildGroupFrom(
        { id, name, emoji }: CreateGroupCommand,
        members: Array<User>,
    ): Group {
        return new Group({ id, name, emoji, members });
    }
}

export class MemberNotFoundError extends Error {
    constructor() {
        super(
            `Group cannot be created: at least one member could not be found`,
        );
    }
}
