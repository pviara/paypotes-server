import { AuthGuard } from '@auth/auth-guard.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ParseNamePipe } from '@users/presentation/pipes/parse-name.pipe';
import { QueryBus } from '@nestjs/cqrs';

export const USERS_API_ROUTE = 'users';

const Name = () => Param('name', ParseNamePipe);

@AuthGuard()
@Controller(USERS_API_ROUTE)
export class UserController {
    constructor(private queryBus: QueryBus) {}

    @Get(':name')
    async getByName(@Name() name: string): Promise<void> {
        // const query = new GetUserByPhoneQuery({ phone });
        // const user = await this.queryBus.execute(query);
        // return UserDTO.from(user);
        return;
    }
}
