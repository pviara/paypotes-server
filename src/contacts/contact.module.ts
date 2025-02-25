import { ContactController } from '@contacts/presentation/contact.controller';
import { contactRepositoryProvider } from '@contacts/persistence/contact.repository-provider';
import { CqrsModule } from '@nestjs/cqrs';
import { GetActorContactByIdHandler } from '@contacts/application/get-actor-contact-by-id.handler';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ContactController],
    imports: [CqrsModule],
    providers: [contactRepositoryProvider, GetActorContactByIdHandler],
})
export class ContactModule {}
