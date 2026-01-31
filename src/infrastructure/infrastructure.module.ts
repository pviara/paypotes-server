import { AsyncLocalStorageModule } from '@infra/async-local-storage/async-local-storage.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infra/database/database.module';
import { LoggerModule } from '@infra/logger/logger.module';
import { Module } from '@nestjs/common';

@Module({
    exports: [ConfigModule],
    imports: [
        AsyncLocalStorageModule,
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule,
        DatabaseModule,
    ],
})
export class InfrastructureModule {}
