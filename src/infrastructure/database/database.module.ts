import { ConfigService } from '@nestjs/config';
import { KnexModule } from 'nestjs-knex';
import { Module } from '@nestjs/common';
import { PostgresService } from '@infra/database/postgres.service';
import { TransactionService } from '@infra/database/transaction.service';

const getBaseOptions = (configService: ConfigService) => ({
    host: configService.getOrThrow('POSTGRES_HOST'),
    port: configService.getOrThrow('POSTGRES_PORT'),
    database: configService.getOrThrow('POSTGRES_DB'),
    user: configService.getOrThrow('POSTGRES_USER'),
    password: configService.getOrThrow('POSTGRES_PASSWORD'),
});

const getTestOptions = (configService: ConfigService) => ({
    ...getBaseOptions(configService),
    port: configService.getOrThrow('POSTGRES_TEST_PORT'),
});

const getOptions = (configService: ConfigService) => {
    return configService.getOrThrow('APP_ENVIRONMENT') !== 'test'
        ? getBaseOptions(configService)
        : getTestOptions(configService);
};

@Module({
    exports: [TransactionService],
    imports: [
        KnexModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    config: {
                        client: 'postgres',
                        connection: getOptions(configService),
                    },
                };
            },
        }),
    ],
    providers: [PostgresService, TransactionService],
})
export class DatabaseModule {}
