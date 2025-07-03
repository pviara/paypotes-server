import { CanActivate, ExecutionContext } from '@nestjs/common';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { User } from '@users/domain/user';

export class AuthFakeGuard implements CanActivate {
    private authenticatedUser = DEFAULT_USER;

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        request.actor = this.authenticatedUser;
        return true;
    }

    setAuthenticatedUser(user: User): void {
        this.authenticatedUser = user;
    }
}
