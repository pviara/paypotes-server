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

const AUTH_API_ROUTE = 'auth';

@Controller(AUTH_API_ROUTE)
export class AuthController {
    constructor(private configService: ConfigService) {}

    @UseGuards(GoogleAuthGuard)
    @Redirect()
    @Get('google-redirect')
    async catchGoogleRedirect(
        @Req() req: unknown,
    ): Promise<HttpRedirectResponse> {
        // const { token } = this.authService.signIn(req.user);
        return this.redirectToClientApp('token');
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google')
    async signInWithGoogle(): Promise<void> {}

    private redirectToClientApp(token: string): HttpRedirectResponse {
        const redirectionUrl = this.configService.get('ALLOWED_ORIGIN');

        return {
            url: `${redirectionUrl}?token=${token}`,
            statusCode: HttpStatus.PERMANENT_REDIRECT,
        };
    }
}
