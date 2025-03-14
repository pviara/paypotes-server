import { ContactModule } from '@contacts/contact.module';
import { ExpenseModule } from '@expenses/expense.module';
import { GroupModule } from '@groups/group.module';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    imports: [ContactModule, ExpenseModule, GroupModule, UserModule],
})
export class AppModule {}
