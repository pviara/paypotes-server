import { AuthController } from '@auth/presentation/auth.controller';
import { AuthService } from '@auth/application/auth.service';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '@auth/strategies/google-strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    controllers: [AuthController],
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.getOrThrow('JWT_SECRET'),
                    signOptions: { expiresIn: '2 days' },
                };
            },
        }),
        PassportModule,
        UserRepositoryModule,
    ],
    providers: [AuthService, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}
