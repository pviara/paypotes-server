import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

export class DefaultPostgresService
    implements OnApplicationShutdown, OnModuleInit
{
    private logger = new Logger(DefaultPostgresService.name);

    constructor(@InjectKnex() private knex: Knex) {}

    onApplicationShutdown(): void {
        return this.knex.destroy(this.logDatabaseConnectionDestroyed());
    }

    async onModuleInit(): Promise<void> {
        const {
            rows: [{ result }],
        } = await this.knex.raw<{ rows: Array<{ result: number }> }>(
            'select 1+1 as result;',
        );

        if (!result) throw new Error('Error connecting to PostgreSQL');
        this.logger.log('Connected to PostgreSQL');
    }

    private logDatabaseConnectionDestroyed(): () => void {
        return () => this.logger.log('Disconnected PostgreSQL');
    }
}
