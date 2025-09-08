import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Log } from '@infra/logger/log.decorator';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

type JwtAuthPayload = {
    email: string;
    iat: number;
    exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,

        @Inject(userRepositoryToken)
        private userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: (request: Request, token: string, done) =>
                done(null, configService.getOrThrow('JWT_SECRET')),
        });
    }

    @Log('debug')
    async validate(payload: JwtAuthPayload): Promise<User> {
        const user = await this.userRepository.getByEmail(payload.email);
        if (user) return user;
        throw new UnauthorizedException(
            `User with email "${payload.email}" has not been found during JWT validation.`,
        );
    }
}
