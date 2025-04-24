import { AuthModule } from '@auth/auth.module';
import { ContactModule } from '@contacts/contact.module';
import { ExpenseModule } from '@expenses/expense.module';
import { GroupModule } from '@groups/group.module';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    imports: [
        ContactModule,
        ExpenseModule,
        GroupModule,
        InfrastructureModule,
        UserModule,
    ],
})
export class AppModule {}
