import { CqrsModule } from '@nestjs/cqrs';
import { GetUserByPhoneHandler } from '@users/application/get-user-by-phone.handler';
import { Module } from '@nestjs/common';
import { UserController } from '@users/presentation/user.controller';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    controllers: [UserController],
    imports: [CqrsModule, UserRepositoryModule],
    providers: [GetUserByPhoneHandler],
})
export class UserModule {}
