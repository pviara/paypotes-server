import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '@auth/auth.module';
import { ContactModule } from '@contacts/contact.module';
import { ExpenseModule } from '@expenses/expense.module';
import { GroupModule } from '@groups/group.module';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { LoggingInterceptor } from '@app/infrastructure/logger/logging.interceptor';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    imports: [
        AuthModule,
        ContactModule,
        ExpenseModule,
        GroupModule,
        InfrastructureModule,
        UserModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {}
