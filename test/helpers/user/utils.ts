import { Contact } from '@contacts/domain/contact';
import { Modules } from '@test/helpers/application/model/module';
import { Providers } from '@test/helpers/application/application';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export const userSpecModules: Modules = [UserModule];
export const userSpecProviders: Providers = [
    {
        provide: userRepositoryToken,
        useClass: UserPostgresTestingRepository,
    },
];

export const generateRandomUser = (): User => {
    return new User({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
        email: 'email@test.com',
        avatarUrl: 'http://localhost:port/avatar_url',
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
                avatarUrl: 'http://localhost:port/avatar_url',
            }),
    );
};

export const mapUserFrom = (contact: Contact): User => {
    return new User({
        id: contact.getId(),
        firstname: contact.getFirstname(),
        lastname: contact.getLastname(),
        email: 'email@test.com',
        avatarUrl: 'http://localhost:port/avatar_url',
    });
};
