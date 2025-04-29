import { AppModule } from '@app/app.module';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export const contactTasksSpecModules: Modules = [AppModule];
export const contactTasksSpecProviders: OverridingProviders = [
    {
        provide: userRepositoryToken,
        useClass: UserInMemoryTestingRepository,
    },
];
