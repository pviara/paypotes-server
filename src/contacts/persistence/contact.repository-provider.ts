import { ContactPostgresRepository } from '@contacts/persistence/contact.postgres-repository';
import { Provider } from '@nestjs/common';

export const contactRepositoryToken = 'ContactRepository';

export const contactRepositoryProvider: Provider = {
    provide: contactRepositoryToken,
    useClass: ContactPostgresRepository,
};
