import { JwtAuthGuard } from '@auth/presentation/guards/jwt.auth-guard';
import { UseGuards } from '@nestjs/common';

export const AuthGuard = () => UseGuards(JwtAuthGuard);
