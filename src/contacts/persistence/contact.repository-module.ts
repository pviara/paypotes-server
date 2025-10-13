import { ContactRepository } from '@contacts/persistence/contact.repository';
import { contactRepositoryProvider } from '@contacts/persistence/contact.repository-provider';
import { Module } from '@nestjs/common';

@Module({
    exports: [ContactRepository],
    providers: [contactRepositoryProvider],
})
export class ContactRepositoryModule {}
