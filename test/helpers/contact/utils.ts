import { AUTHENTICATED_USER } from '@test/doubles/auth/authenticated-user';
import { ContactInMemoryTestingRepository } from '@test/helpers/contact/contact.testing-repository';
import { ContactModule } from '@contacts/contact.module';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { Contact } from '@contacts/domain/contact';
import { generateRandomUser } from '@test/helpers/user/utils';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Relationship } from '@contacts/persistence/relationship';
import { User } from '@app/users/domain/user';

export const contactSpecModules: Modules = [ContactModule];
export const contactSpecProviders: OverridingProviders = [
    {
        provide: contactRepositoryToken,
        useClass: ContactInMemoryTestingRepository,
    },
];

const getAuthenticatedUserAsContact = (): Contact => {
    return new Contact({
        id: AUTHENTICATED_USER.getId(),
        firstname: AUTHENTICATED_USER.getFirstname(),
        lastname: AUTHENTICATED_USER.getLastname(),
    });
};

export const generateAuthenticatedUserRelationship = (): Relationship => {
    return {
        userA: getAuthenticatedUserAsContact(),
        userB: generateRandomContact(),
    };
};

export const generateAuthenticatedUserRelationships = (options: {
    contacts: Array<Contact>;
}): Array<Relationship> => {
    return options.contacts.map((contact) => ({
        userA: getAuthenticatedUserAsContact(),
        userB: contact,
    }));
};

export const generateRandomContact = (): Contact => {
    return new Contact({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
    });
};

export const generateRandomContacts = (
    options: RandomArrayGenerationOptions,
): Array<Contact> => {
    return Array.from({ length: options.length ?? 4 }).map(
        (_, index) =>
            new Contact({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
            }),
    );
};
