import { Contact } from '@contacts/domain/contact';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { User } from '@users/domain/user';
import { UserInMemoryTestingRepository } from './user.testing-repository';
import { UserModule } from '@users/user.module';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

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

export const generateRandomUsers = (
    options: RandomArrayGenerationOptions,
): Array<User> => {
    return Array.from({ length: options.length }).map(
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

export const mapUserFrom = (contact: Contact): User => {
    return new User({
        id: contact.getId(),
        firstname: contact.getFirstname(),
        lastname: contact.getLastname(),
        email: 'email@test.com',
        phone: '0673182944',
    });
};
