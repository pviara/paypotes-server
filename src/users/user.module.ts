import { CqrsModule } from '@nestjs/cqrs';
import { GetUserByPhoneHandler } from '@users/application/get-user-by-phone.handler';
import { Module } from '@nestjs/common';
import { UserController } from '@users/presentation/user.controller';
import {
    userRepositoryProvider,
    userRepositoryToken,
} from '@users/persistence/user-repository.provider';

@Module({
    controllers: [UserController],
    exports: [userRepositoryToken],
    imports: [CqrsModule],
    providers: [GetUserByPhoneHandler, userRepositoryProvider],
})
export class UserModule {}
