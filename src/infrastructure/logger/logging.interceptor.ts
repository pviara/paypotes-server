import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { DefaultLoggerService } from './logger.service';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private logger: DefaultLoggerService) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const now = new Date().toISOString();
        const request = context.switchToHttp().getRequest();

        const method = request.method;
        const url = request.originalUrl;

        this.logger.setContext(LoggingInterceptor.name);
        this.logger.log(`${now} ${method} ${url}`);
        this.logger.resetContext();
        return next.handle();
    }
}
