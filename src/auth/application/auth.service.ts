import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Nullable } from '@app/shared/nullable';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { SignedInUser } from '@auth/domain/signed-in-user';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';

type GoogleProfile = {
    email: string;
    given_name: string;
    family_name: string;
    picture: string;
};

type UserProfile = {
    firstname: string;
    lastname: string;
    email: string;
    avatarUrl: string;
};

@Injectable()
export class AuthService {
    private googleClient = new OAuth2Client({
        client_id: this.configService.getOrThrow('OAUTH_CLIENT'),
    });

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private userRepository: UserRepository,
    ) {}

    async signInGoogle(idToken: string): Promise<SignedInUser> {
        const response = await this.googleClient.verifyIdToken({
            idToken,
            audience: this.configService.getOrThrow('OAUTH_IOS_CLIENT'),
        });
        const payload = response.getPayload();
        if (!payload) throw new BadRequestException('No payload received');

        const profile = this.extractGoogleProfileFrom(payload);
        const user = await this.getOrCreateUserFrom(profile);

        return this.signInStandard(user);
    }

    signInStandard(user: User): SignedInUser {
        return {
            token: this.jwtService.sign({
                id: user.getId(),
                email: user.getEmail(),
            }),
            user,
        };
    }

    private extractGoogleProfileFrom(payload: TokenPayload): GoogleProfile {
        return {
            email: payload.email ?? '',
            given_name: payload.given_name ?? '',
            family_name: payload.family_name ?? '',
            picture: payload.picture ?? '',
        };
    }

    private async getOrCreateUserFrom(profile: GoogleProfile): Promise<User> {
        const user = await this.userRepository.getByEmail(profile.email);
        if (user) return user;

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

    private extractUserProfileFrom(profile: GoogleProfile): UserProfile {
        const { given_name: firstname, family_name: lastname } = profile;
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
