import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { DateService } from '@app/shared/date/date.service';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { Log } from '@infra/logger/log.decorator';
import { Member } from '@groups/domain/member';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';

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
        private dateService: DateService,
        private groupRepository: GroupRepository,
        private userRepository: UserRepository,
        private messenger: ContactTaskMessenger,
    ) {}

    @Log('debug')
    async execute(command: CreateGroupCommand): Promise<void> {
        const { payload } = command;

        const users = await this.userRepository.get(...payload.userIds);
        if (users.length < payload.userIds.length) {
            throw new GroupUserNotFoundError();
        }

        const group = new Group({
            id: payload.id,
            name: payload.name,
            emoji: payload.emoji,
            createdAt: this.dateService.getCurrentDate(),
            members: this.mapToMembers(users),
        });

        await Promise.all([
            this.groupRepository.save(group),
            this.messenger.sendRelationshipsMustBeCreatedBetween(
                this.mapIdsFrom(users),
            ),
        ]);
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
