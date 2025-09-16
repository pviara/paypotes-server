import { Injectable } from '@nestjs/common';

type Type = 'DEBUG' | 'LOG' | 'ERROR';

type Log = {
    type: string;
    correlationId: string;
    date: string;
    message: string;
    context: string;
    args: Array<unknown>;
};

@Injectable()
export class LoggerService {
    debug(
        message: string,
        context: string,
        correlationId: string,
        ...args: Array<unknown>
    ): void {
        const log: Log = this.createLogFrom(
            'DEBUG',
            message,
            context,
            correlationId,
            args,
        );
        console.debug(JSON.stringify(log));
    }

    error(
        message: string,
        context: string,
        correlationId: string,
        ...args: Array<unknown>
    ): void {
        const log: Log = this.createLogFrom(
            'ERROR',
            message,
            context,
            correlationId,
            args,
        );
        console.error(JSON.stringify(log));
    }

    log(
        message: string,
        context: string,
        correlationId: string,
        ...args: Array<unknown>
    ): void {
        const log: Log = this.createLogFrom(
            'LOG',
            message,
            context,
            correlationId,
            args,
        );
        console.log(JSON.stringify(log));
    }

    private createLogFrom(
        type: Type,
        message: string,
        context: string,
        correlationId: string,
        args: Array<unknown>,
    ): Log {
        const now = new Date().toISOString();
        return {
            type,
            correlationId,
            date: now,
            message,
            context,
            args,
        };
    }
}
