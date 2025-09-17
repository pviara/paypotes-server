import { AsyncLocalStorage } from 'async_hooks';
import { AuthModule } from '@auth/auth.module';
import { ContactModule } from '@contacts/contact.module';
import { ExpenseModule } from '@expenses/expense.module';
import { GroupModule } from '@groups/group.module';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { LoggerService } from '@infra/logger/logger.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserModule } from '@users/user.module';

@Module({
    imports: [
        AuthModule,
        ContactModule,
        ExpenseModule,
        GroupModule,
        InfrastructureModule,
        UserModule,
    ],
})
export class AppModule implements NestModule {
    constructor(
        private als: AsyncLocalStorage<any>,
        private logger: LoggerService,
    ) {}

    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply((req: Request, res: Response, next: NextFunction) => {
                const correlationId = crypto.randomUUID();

                const method = req.method;
                const url = req.originalUrl;

                this.logger.log(
                    `${method} ${url} ${res.statusCode}`,
                    AppModule.name,
                    correlationId,
                );

                const store = { 'x-correlation-id': correlationId };
                this.als.run(store, () => next());
            })
            .forRoutes('*');
    }
}
