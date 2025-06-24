import { Contact } from '@contacts/domain/contact';
import { ContactInMemoryTestingRepository } from '@test/helpers/contact/contact.testing-repository';
import { ContactModule } from '@contacts/contact.module';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseModule } from '@expenses/expense.module';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Modules } from '@test/helpers/application-runner/model/module';
import { Providers } from '@test/helpers/application-runner/model/overriding-provider';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Relationship } from '@contacts/persistence/relationship';

export const contactSpecModules: Modules = [ContactModule, ExpenseModule];
export const contactSpecProviders: Providers = [
    {
        provide: contactRepositoryToken,
        useClass: ContactInMemoryTestingRepository,
    },
    {
        provide: expenseRepositoryToken,
        useClass: ExpenseInMemoryTestingRepository,
    },
];

const getDefaultUserAsContact = (): Contact => {
    return new Contact({
        id: DEFAULT_USER.getId(),
        firstname: DEFAULT_USER.getFirstname(),
        lastname: DEFAULT_USER.getLastname(),
        avatarUrl: DEFAULT_USER.getAvatarUrl(),
    });
};

export const generateDefaultUserRelationship = (): Relationship => {
    return {
        userA: getDefaultUserAsContact(),
        userB: generateRandomContact(),
    };
};

export const generateDefaultUserRelationships = (options: {
    contacts: Array<Contact>;
}): Array<Relationship> => {
    return options.contacts.map((contact) => ({
        userA: getDefaultUserAsContact(),
        userB: contact,
    }));
};

export const generateRandomContact = (): Contact => {
    return new Contact({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
        avatarUrl: 'http://localhost:port/avatar_url',
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
                avatarUrl: 'http://localhost:port/avatar_url',
            }),
    );
};
