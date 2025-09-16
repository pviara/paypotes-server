import { AsyncLocalStorage } from 'async_hooks';
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { LoggerService } from '@infra/logger/logger.service';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        private als: AsyncLocalStorage<any>,
        private logger: LoggerService,
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const correlationId = this.als.getStore()?.['x-correlation-id'];
        const request = context.switchToHttp().getRequest();

        const method = request.method;
        const url = request.originalUrl;

        this.logger.log(
            `${method} ${url}`,
            LoggingInterceptor.name,
            correlationId,
        );
        return next.handle();
    }
}
