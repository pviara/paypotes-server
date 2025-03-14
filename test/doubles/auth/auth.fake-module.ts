import { AuthFakeGuard } from '@test/doubles/auth/auth.fake-guard';
import { Module } from '@nestjs/common';

@Module({
    exports: [AuthFakeGuard],
    providers: [AuthFakeGuard],
})
export class AuthFakeModule {}
