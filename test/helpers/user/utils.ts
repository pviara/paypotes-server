import { Contact } from '@contacts/domain/contact';
import { Modules } from '@test/helpers/application/model/module';
import { Providers } from '@test/helpers/application/application';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';
import { Person } from '@app/expenses/domain/stakeholder/stakeholder';

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

export const mapUserFrom = (person: Person): User => {
    return new User({
        id: person.getId(),
        firstname: person.getFirstname(),
        lastname: person.getLastname(),
        email: 'email@test.com',
        avatarUrl: 'http://localhost:port/avatar_url',
    });
};

export const mapUsersFrom = (persons: Array<Person>): Array<User> => {
    return persons.map(
        (person) =>
            new User({
                id: person.getId(),
                firstname: person.getFirstname(),
                lastname: person.getLastname(),
                email: 'email@test.com',
                avatarUrl: 'http://localhost:port/avatar_url',
            }),
    );
};
