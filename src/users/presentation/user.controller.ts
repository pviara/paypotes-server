import { AuthGuard } from '@auth/auth-guard.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { GetUserByPhoneQuery } from '@users/application/get-user-by-phone.handler';
import { QueryBus } from '@nestjs/cqrs';
import { User } from '@users/domain/user';

const Phone = () => Param('phone');

@AuthGuard()
@Controller('user')
export class UserController {
    constructor(private queryBus: QueryBus) {}

    @Get(':phone')
    getByPhone(@Phone() phone: string): Promise<User> {
        const query = new GetUserByPhoneQuery({ phone });
        return this.queryBus.execute(query);
    }
}
