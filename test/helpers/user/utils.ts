import { Modules } from '@test/helpers/application/model/module';
import { Person } from '@expenses/domain/stakeholder/stakeholder';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { User } from '@users/domain/user';
import { UserModule } from '@users/user.module';
import { ContactModule } from '@app/contacts/contact.module';

export const userSpecModules: Modules = [UserModule, ContactModule];

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
