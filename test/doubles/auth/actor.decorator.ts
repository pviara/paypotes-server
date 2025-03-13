import {
    createParamDecorator,
    ExecutionContext,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@users/domain/user';

export const ActorId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (request.actor instanceof User) {
            return request.actor.getId();
        }
        throw new InternalServerErrorException(
            'Actor not found in http context',
        );
    },
);

export const Actor = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (request.actor instanceof User) {
            return request.actor;
        }
        throw new InternalServerErrorException(
            'Actor not found in http context',
        );
    },
);
