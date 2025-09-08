import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { Nullable } from '@app/shared/nullable';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

type GoogleProfile = {
    email: string;
    name: { givenName: string; familyName: string };
    photos: Array<{ value: string }>;
};

type UserProfile = {
    firstname: string;
    lastname: string;
    email: string;
    avatarUrl: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,

        @Inject(userRepositoryToken)
        private userRepository: UserRepository,
    ) {
        super({
            clientID: configService.getOrThrow('OAUTH_CLIENT'),
            clientSecret: configService.getOrThrow('OAUTH_SECRET'),
            callbackURL: configService.getOrThrow('OAUTH_REDIRECT_URL'),
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
            const { firstname, lastname, email, avatarUrl } =
                this.extractUserProfileFrom(profile);
            const userToAdd = new User({
                id: this.getAppLocalUserId() ?? crypto.randomUUID(),
                firstname,
                lastname,
                email,
                avatarUrl,
            });
            await this.userRepository.create(userToAdd);
            return this.getOrCreateUserFrom(profile);
        }
        return user;
    }

    private extractUserProfileFrom(profile: GoogleProfile): UserProfile {
        const { givenName: firstname, familyName: lastname } = profile.name;
        return {
            firstname,
            lastname,
            email: profile.email,
            avatarUrl: this.getAvatarUrlFrom(firstname, lastname),
        };
    }

    private getAppLocalUserId(): Nullable<string> {
        return this.configService.getOrThrow('APP_ENVIRONMENT') === 'local'
            ? 'b714106e-7691-49f9-94c9-86eaea845642'
            : null;
    }

    private getAvatarUrlFrom(firstname: string, lastname: string): string {
        return `https://ui-avatars.com/api/?name=${firstname}+${lastname}`;
    }
}
