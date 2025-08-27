import { ContactPostgresTestingRepository } from '@test/helpers/contact/contact.postgres-testing-repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Modules } from '@test/helpers/application/model/module';
import { Person } from '@expenses/domain/stakeholder/stakeholder';
import { Providers } from '@test/helpers/application/application';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export const userSpecModules: Modules = [UserModule];
export const userSpecProviders: Providers = [
    {
        provide: contactRepositoryToken,
        useClass: ContactPostgresTestingRepository,
    },
    {
        provide: expenseRepositoryToken,
        useClass: ExpensePostgresTestingRepository,
    },
    {
        provide: groupRepositoryToken,
        useClass: GroupPostgresTestingRepository,
    },
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
