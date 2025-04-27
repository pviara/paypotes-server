import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
    exports: [ConfigModule],
    imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class InfrastructureModule {}
