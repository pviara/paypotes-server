import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PostgresModule } from '@infra/postgres/postgres.module';

@Module({
    exports: [ConfigModule],
    imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class InfrastructureModule {}
