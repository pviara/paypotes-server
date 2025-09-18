import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { contactTaskMessengerToken } from '@infra/contact-task-managers/contact.task-messenger.provider';
import { DateService } from '@app/shared/date/date.service';
import { dateServiceProviderToken } from '@app/shared/date/date.service.provider';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { Log } from '@infra/logger/log.decorator';
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
        @Inject(dateServiceProviderToken)
        private dateService: DateService,

        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,

        @Inject(userRepositoryToken)
        private userRepository: UserRepository,

        @Inject(contactTaskMessengerToken)
        private messenger: ContactTaskMessenger,
    ) {}

    @Log('debug')
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
                createdAt: this.dateService.getCurrentDate(),
                members: this.mapToMembers(users),
            }),
        );

        const userIds = this.mapIdsFrom(users);
        this.messenger.sendRelationshipsMustBeCreatedBetween(userIds);
    }

    private mapToMembers(users: Array<User>): Array<Member> {
        return users.map((user) => Member.fromUser(user));
    }

    private mapIdsFrom(users: Array<User>): Array<string> {
        return users.map((user) => user.getId());
    }
}

export class GroupUserNotFoundError extends Error {
    constructor() {
        super(`Group cannot be created: at least one user could not be found`);
    }
}
