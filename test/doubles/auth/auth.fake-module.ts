import { AuthFakeGuard } from './auth.fake-guard';
import { Module } from '@nestjs/common';

@Module({
    exports: [AuthFakeGuard],
    providers: [AuthFakeGuard],
})
export class AuthFakeModule {}
