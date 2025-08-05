import { ConfigService } from '@nestjs/config';
import { DefaultPostgresService } from './postgres.service';
import { KnexModule } from 'nestjs-knex';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        KnexModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const options = {
                    host: configService.getOrThrow('POSTGRES_HOST'),
                    port:
                        configService.getOrThrow('APP_ENVIRONMENT') !== 'test'
                            ? configService.getOrThrow('POSTGRES_PORT')
                            : configService.getOrThrow('POSTGRES_TEST_PORT'),
                    database: configService.getOrThrow('POSTGRES_DB'),
                    user: configService.getOrThrow('POSTGRES_USER'),
                    password: configService.getOrThrow('POSTGRES_PASSWORD'),
                };

                return {
                    config: {
                        client: 'postgres',
                        connection: options,
                    },
                };
            },
        }),
    ],
    providers: [DefaultPostgresService],
})
export class PostgresModule {}
