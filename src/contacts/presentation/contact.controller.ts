import { AuthGuard } from '@app/auth/auth-guard.decorator';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ActorId } from '@test/doubles/auth/actor.decorator';
import { GetActorContactByIdQuery } from '../application/get-actor-contact-by-id.handler';
import { ContactDTO } from './dto/contact.dto';
import { Contact } from '../domain/contact';

export const CONTACTS_API_ROUTE = 'contacts';

const ContactId = () => Param('id', ParseUUIDPipe);

@AuthGuard()
@Controller(CONTACTS_API_ROUTE)
export class ContactController {
    constructor(private queryBus: QueryBus) {}

    @Get(':id')
    async getActorContactById(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
    ): Promise<ContactDTO> {
        const query = new GetActorContactByIdQuery({ actorId, contactId });
        const contact = await this.queryBus.execute(query);
        return this.mapDTOFrom(contact);
    }

    @Get()
    async getActorContacts(): Promise<unknown> {
        return [];
    }

    private mapDTOFrom(contact: Contact): ContactDTO {
        return {
            id: contact.getId(),
            firstname: contact.getFirstname(),
            lastname: contact.getLastname(),
        };
    }
}
