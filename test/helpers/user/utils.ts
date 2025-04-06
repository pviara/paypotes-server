import { userRepositoryToken } from '@users/persistence/user.repository-provider';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { User } from '@users/domain/user';
import { UserInMemoryTestingRepository } from './user.testing-repository';
import { UserModule } from '@users/user.module';

export const userSpecModules: Modules = [UserModule];
export const userSpecProviders: OverridingProviders = [
    {
        provide: userRepositoryToken,
        useClass: UserInMemoryTestingRepository,
    },
];

export const generateRandomUser = (): User => {
    return new User({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
        email: 'email@test.com',
        phone: '0603497712',
    });
};

export const generateRandomUsers = (): Array<User> => {
    return Array.from({ length: 4 }).map(
        (_, index) =>
            new User({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
                email: 'email@test.com',
                phone: '078452168344',
            }),
    );
};
