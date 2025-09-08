import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';
import { Users } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class GetUserByNameQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            name: string;
        },
    ) {}
}

@QueryHandler(GetUserByNameQuery)
export class GetUserByNameHandler implements IQueryHandler<GetUserByNameQuery> {
    constructor(
        @Inject(userRepositoryToken)
        private userRepository: UserRepository,
    ) {}

    @Log('debug')
    async execute(query: GetUserByNameQuery): Promise<Users> {
        const { actorId, name } = query.payload;
        const users = await this.userRepository.getByName(name);
        return users.filter((user) => user.getId() !== actorId);
    }
}
