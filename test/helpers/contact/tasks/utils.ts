import { AuthFakeModule } from '@test/doubles/auth/auth.fake-module';
import { ContactModule } from '@contacts/contact.module';
import { ExpenseModule } from '@expenses/expense.module';
import { GroupModule } from '@groups/group.module';
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
        provide: userRepositoryToken,
        useClass: UserPostgresTestingRepository,
    },
];
