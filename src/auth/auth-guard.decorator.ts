import { AuthFakeGuard } from '@test/doubles/auth/auth.fake-guard';
import { UseGuards } from '@nestjs/common';

export const AuthGuard = () => UseGuards(AuthFakeGuard);
