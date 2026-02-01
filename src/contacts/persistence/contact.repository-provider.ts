import { ContactDatabaseRepository } from '@app/contacts/persistence/contact.database-repository';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Provider } from '@nestjs/common';

export const contactRepositoryProvider: Provider = {
    provide: ContactRepository,
    useClass: ContactDatabaseRepository,
};
