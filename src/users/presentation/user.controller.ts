import { AuthGuard } from '@auth/auth-guard.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { GetUserByPhoneQuery } from '@users/application/get-user-by-phone.handler';
import { ParsePhoneNumberPipe } from '@users/presentation/pipes/parse-phone-number.pipe';
import { QueryBus } from '@nestjs/cqrs';
import { UserDTO } from '@users/presentation/dto/user.dto';

export const USERS_API_ROUTE = 'users';

const Phone = () => Param('phone', ParsePhoneNumberPipe);

@AuthGuard()
@Controller(USERS_API_ROUTE)
export class UserController {
    constructor(private queryBus: QueryBus) {}

    @Get(':phone')
    async getByPhone(@Phone() phone: string): Promise<UserDTO> {
        const query = new GetUserByPhoneQuery({ phone });
        const user = await this.queryBus.execute(query);
        return UserDTO.from(user);
    }
}
