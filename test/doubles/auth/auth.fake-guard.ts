import { AUTHENTICATED_USER } from './authenticated-user';

import { CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '@users/domain/user';

export class AuthFakeGuard implements CanActivate {
    private authenticatedUser = AUTHENTICATED_USER;

    canActivate(context: ExecutionContext): boolean {
        if (!this.authenticatedUser) {
            throw new Error('No fake authenticated user');
        }

        const request = context.switchToHttp().getRequest();
        request.actor = this.authenticatedUser;
        return true;
    }

    setAuthenticatedUser(user: User): void {
        this.authenticatedUser = user;
    }
}
