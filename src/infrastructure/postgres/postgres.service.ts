import { ConfigService } from '@nestjs/config';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { MigrationSource } from '@infra/postgres/migration-source';

export class DefaultPostgresService
    implements OnApplicationShutdown, OnModuleInit
{
    private logger = new Logger(DefaultPostgresService.name);

    constructor(
        private configService: ConfigService,
        @InjectKnex() private knex: Knex,
    ) {}

    onApplicationShutdown(): void {
        return this.knex.destroy(this.logDatabaseConnectionDestroyed());
    }

    onModuleInit(): Promise<void> {
        this.checkDatabaseConnected();
        this.logConnectedToDatabase();
        const path = this.configService.getOrThrow('POSTGRES_MIGRATIONS_PATH');
        return this.knex.migrate.latest({
            migrationSource: new MigrationSource(path),
            tableName: 'migrations',
        });
    }

    private logDatabaseConnectionDestroyed(): () => void {
        return () => this.logger.log('Disconnected PostgreSQL');
    }

    private async checkDatabaseConnected(): Promise<void> {
        const {
            rows: [{ result }],
        } = await this.knex.raw<{ rows: Array<{ result: number }> }>(
            'select 1+1 as result;',
        );
        if (!result) throw new Error('Error connecting to PostgreSQL');
    }

    private logConnectedToDatabase(): void {
        this.logger.log('Connected to PostgreSQL');
    }
}
