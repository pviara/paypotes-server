import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

type GoogleProfile = {
    email: string;
    name: { givenName: string; familyName: string };
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,

        @Inject(userRepositoryToken)
        private userRepository: UserRepository,
    ) {
        super({
            clientID: configService.get('OAUTH_CLIENT', ''),
            clientSecret: configService.get('OAUTH_SECRET', ''),
            callbackURL: configService.get('OAUTH_REDIRECT_URL', ''),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
    ): Promise<void> {
        const user = await this.getOrCreateUserFrom(profile);
        done(null, user);
    }

    private async getOrCreateUserFrom(profile: GoogleProfile): Promise<User> {
        const user = await this.userRepository.getByEmail(profile.email);
        if (!user) {
            const userToAdd = new User({
                id: crypto.randomUUID(),
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                email: profile.email,
                avatarUrl: '',
            });
            await this.userRepository.create(userToAdd);
            return this.getOrCreateUserFrom(profile);
        }
        return user;
    }
}
