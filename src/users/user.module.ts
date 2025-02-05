import { Module } from '@nestjs/common';
import { UserRepositoryProvider } from '@users/persistence/user.repository-provider';

@Module({
    providers: [UserRepositoryProvider],
})
export class UserModule {}
