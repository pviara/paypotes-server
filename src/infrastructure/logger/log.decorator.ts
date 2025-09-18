import { AsyncLocalStorage } from 'async_hooks';
import { Inject, LogLevel } from '@nestjs/common';
import { LoggerService } from '@infra/logger/logger.service';

export const Log = (level: LogLevel) => {
    const injectLogger = Inject(LoggerService);
    const injectAls = Inject(AsyncLocalStorage);

    return (target: any, propertyKey: string, descriptor: any) => {
        injectLogger(target, 'logger');
        injectAls(target, 'als');

        const decoratedMethod = descriptor.value;
        descriptor.value = async function (
            ...args: Array<unknown>
        ): Promise<unknown> {
            if (process.env.APP_ENVIRONMENT === 'test')
                return decoratedMethod.apply(this, args);

            const context = target.constructor.name;
            const correlationId = this.als.getStore()?.['x-correlation-id'];

            try {
                this.logger[level](
                    `Called method ${propertyKey}`,
                    context,
                    correlationId,
                    args,
                );

                return await decoratedMethod.apply(this, args);
            } catch (error: any) {
                this.logger.error(
                    error['message'],
                    `${context}.${propertyKey}`,
                    correlationId,
                    args,
                );
                throw error;
            }
        };
    };
};
