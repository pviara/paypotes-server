import { AuthService } from '@auth/application/auth.service';
import { ConfigService } from '@nestjs/config';
import {
    Controller,
    Get,
    HttpRedirectResponse,
    HttpStatus,
    Redirect,
    Req,
    UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from '@auth/presentation/guards/google.auth-guard';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt.auth-guard';
import { SignedInRequest } from '@auth/presentation/model/signed-in-request';
import { User } from '@app/users/domain/user';

const AUTH_API_ROUTE = 'auth';

@Controller(AUTH_API_ROUTE)
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {}

    @UseGuards(GoogleAuthGuard)
    @Redirect()
    @Get('google-redirect')
    async catchGoogleRedirect(
        @Req() req: SignedInRequest,
    ): Promise<HttpRedirectResponse> {
        const { token } = this.authService.signIn(req.user);
        return this.redirectToClientApp(token);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserFromToken(@Req() req: SignedInRequest): Promise<User> {
        return req.user;
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google')
    async signInWithGoogle(): Promise<void> {}

    private redirectToClientApp(token: string): HttpRedirectResponse {
        const redirectionUrl = this.configService.getOrThrow('ALLOWED_ORIGIN');

        return {
            url: `${redirectionUrl}?token=${token}`,
            statusCode: HttpStatus.PERMANENT_REDIRECT,
        };
    }
}
