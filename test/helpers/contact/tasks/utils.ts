import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { ContactModule } from '@contacts/contact.module';
import { ContactPostgresTestingRepository } from '@test/helpers/contact/contact.postgres-testing-repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { ExpenseModule } from '@expenses/expense.module';
import { ExpensePostgresRepository } from '@expenses/persistence/expense.postgres-repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupModule } from '@groups/group.module';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Modules } from '@test/helpers/application/model/module';
import { Providers } from '@test/helpers/application/application';
import { UserModule } from '@users/user.module';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';

export const contactTasksSpecModules: Modules = [
    AuthFakeModule,
    ContactModule,
    ExpenseModule,
    GroupModule,
    InfrastructureModule,
    UserModule,
];
export const contactTasksSpecProviders: Providers = [
    {
        provide: contactRepositoryToken,
        useClass: ContactPostgresTestingRepository,
    },
    {
        provide: userRepositoryToken,
        useClass: UserPostgresTestingRepository,
    },
    {
        provide: expenseRepositoryToken,
        useClass: ExpensePostgresRepository,
    },
    {
        provide: groupRepositoryToken,
        useClass: GroupPostgresTestingRepository,
    },
];
