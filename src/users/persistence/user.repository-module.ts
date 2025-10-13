import { Module } from '@nestjs/common';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryProvider } from '@users/persistence/user.repository-provider';

@Module({
    exports: [UserRepository],
    providers: [userRepositoryProvider],
})
export class UserRepositoryModule {}
