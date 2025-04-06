import { Module } from '@nestjs/common';
import {
    userRepositoryProvider,
    userRepositoryToken,
} from '@users/persistence/user.repository-provider';

@Module({
    exports: [userRepositoryToken],
    providers: [userRepositoryProvider],
})
export class UserRepositoryModule {}
