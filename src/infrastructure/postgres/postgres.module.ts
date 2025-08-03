import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    type: 'postgres',
                    host: configService.getOrThrow('POSTGRES_HOST'),
                    port: configService.getOrThrow('POSTGRES_PORT'),
                    database: configService.getOrThrow('POSTGRES_DB'),
                    user: configService.getOrThrow('POSTGRES_USER'),
                    password: configService.getOrThrow('POSTGRES_PASSWORD'),
                };
            },
        }),
    ],
})
export class PostgresModule {}
