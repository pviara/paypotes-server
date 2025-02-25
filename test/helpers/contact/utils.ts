import { ContactInMemoryTestingRepository } from '@test/helpers/contact/contact.testing-repository';
import { ContactModule } from '@contacts/contact.module';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { Contact } from '@contacts/domain/contact';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { RandomArrayGenerationOptions } from '@test/helpers/types';

export const contactSpecModules: Modules = [ContactModule];
export const contactSpecProviders: OverridingProviders = [
    {
        provide: contactRepositoryToken,
        useClass: ContactInMemoryTestingRepository,
    },
];

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
