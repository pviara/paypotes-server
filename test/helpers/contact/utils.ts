import { Contact } from '@contacts/domain/contact';
import { ContactModule } from '@contacts/contact.module';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseModule } from '@expenses/expense.module';
import { Modules } from '@test/helpers/application/model/module';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Relationship } from '@contacts/persistence/relationship';

export const contactSpecModules: Modules = [ContactModule, ExpenseModule];

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
