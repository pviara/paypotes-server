import { ContactPostgresRepository } from '@contacts/persistence/contact.postgres-repository';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { Provider } from '@nestjs/common';

export const contactRepositoryProvider: Provider = {
    provide: ContactRepository,
    useClass: ContactPostgresRepository,
};
