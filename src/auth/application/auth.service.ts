import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignedInUser } from '@auth/domain/signed-in-user';
import { User } from '@users/domain/user';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    signIn(user: User): SignedInUser {
        return {
            token: this.jwtService.sign({
                id: user.getId(),
                email: user.getEmail(),
            }),
            user,
        };
    }
}
