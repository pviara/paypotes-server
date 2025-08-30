import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { ContactModule } from '@contacts/contact.module';
import { ExpenseModule } from '@expenses/expense.module';
import { GroupModule } from '@groups/group.module';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application/model/module';
import { UserModule } from '@users/user.module';

export const contactTasksSpecModules: Modules = [
    AuthFakeModule,
    ContactModule,
    ExpenseModule,
    GroupModule,
    InfrastructureModule,
    UserModule,
];
