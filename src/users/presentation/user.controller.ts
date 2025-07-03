import { ActorId } from '@auth/presentation/model/actor.decorator';
import { AuthGuard } from '@auth/auth-guard.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { GetUserByNameQuery } from '@users/application/get-user-by-name.handler';
import { ParseNamePipe } from '@users/presentation/pipes/parse-name.pipe';
import { QueryBus } from '@nestjs/cqrs';
import { User } from '@users/domain/user';
import { UserDTO } from '@users/presentation/dto/user.dto';

export const USERS_API_ROUTE = 'users';

const Name = () => Query('name', ParseNamePipe);

@AuthGuard()
@Controller(USERS_API_ROUTE)
export class UserController {
    constructor(private queryBus: QueryBus) {}

    @Get()
    async getByName(
        @ActorId() actorId: string,
        @Name() name: string,
    ): Promise<UserDTO> {
        const query = new GetUserByNameQuery({ actorId, name });
        const users = await this.queryBus.execute(query);
        return users.map((user: User) => UserDTO.from(user));
    }
}
