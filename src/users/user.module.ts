import { CqrsModule } from '@nestjs/cqrs';
import { GetUserByNameHandler } from '@users/application/get-user-by-name.handler';
import { Module } from '@nestjs/common';
import { UserController } from '@users/presentation/user.controller';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    controllers: [UserController],
    imports: [CqrsModule, UserRepositoryModule],
    providers: [GetUserByNameHandler],
})
export class UserModule {}
