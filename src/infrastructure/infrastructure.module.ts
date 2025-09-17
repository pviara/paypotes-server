import { AsyncLocalStorageModule } from '@infra/async-local-storage/async-local-storage.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@infra/logger/logger.module';
import { Module } from '@nestjs/common';
import { PostgresModule } from '@infra/postgres/postgres.module';

@Module({
    exports: [ConfigModule],
    imports: [
        AsyncLocalStorageModule,
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule,
        PostgresModule,
    ],
})
export class InfrastructureModule {}
