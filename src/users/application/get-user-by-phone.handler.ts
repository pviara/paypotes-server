import { IQuery, IQueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '@users/persistence/user.repository';

export class GetUserByPhoneQuery implements IQuery {
    constructor(
        readonly payload: {
            phone: string;
        },
    ) {}
}

export class GetUserByPhoneHandler
    implements IQueryHandler<GetUserByPhoneQuery>
{
    constructor(private userRepo: UserRepository) {}

    async execute(query: GetUserByPhoneQuery): Promise<any> {
        const { phone } = query.payload;
        const user = await this.userRepo.getByPhone(phone);

        if (user) return user;
        throw new UserNotFoundError(phone);
    }
}

export class UserNotFoundError extends Error {
    constructor(phone: string) {
        super(`User with phone number "${phone}" could not be found`);
    }
}
