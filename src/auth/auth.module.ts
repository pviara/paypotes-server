import { AuthController } from '@auth/presentation/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '@auth/strategies/google-strategy';
import { JwtModule } from '@nestjs/jwt';
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
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '2 days' },
                };
            },
        }),
        PassportModule,
        UserRepositoryModule,
    ],
    providers: [GoogleStrategy],
})
export class AuthModule {}
