import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class GetUserByNameQuery implements IQuery {
    constructor(
        readonly payload: {
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

    async execute(query: GetUserByNameQuery): Promise<any> {
        const { name } = query.payload;
        return this.userRepository.getByName(name);
    }
}
