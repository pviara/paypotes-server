import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export class GetUserByPhoneQuery implements IQuery {
    constructor(
        readonly payload: {
            phone: string;
        },
    ) {}
}

@QueryHandler(GetUserByPhoneQuery)
export class GetUserByPhoneHandler
    implements IQueryHandler<GetUserByPhoneQuery>
{
    constructor(
        @Inject(userRepositoryToken)
        private userRepository: UserRepository,
    ) {}

    async execute(query: GetUserByPhoneQuery): Promise<any> {
        const { phone } = query.payload;
        const user = await this.userRepository.getByPhone(phone);

        if (user) return user;
        throw new UserNotFoundError(phone);
    }
}

export class UserNotFoundError extends Error {
    constructor(phone: string) {
        super(`User with phone number "${phone}" could not be found`);
    }
}
