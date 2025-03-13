import { ActorId } from '@test/doubles/auth/actor.decorator';
import { AuthGuard } from '@auth/auth-guard.decorator';
import { Contact } from '@contacts/domain/contact';
import { ContactDTO } from '@contacts/presentation/dto/contact.dto';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { GetActorContactByIdQuery } from '@contacts/application/get-actor-contact-by-id.handler';
import { GetActorContactsQuery } from '@contacts/application/get-actor-contacts.handler';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { QueryBus } from '@nestjs/cqrs';
import { Search } from '@app/shared/decorators/search.query-decorator';

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
        return ContactDTO.from(contact);
    }

    @Get()
    async getActorContacts(
        @ActorId() actorId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<ContactDTO[]> {
        const query = new GetActorContactsQuery({
            actorId,
            pageIndex,
            search,
        });
        const contacts = await this.queryBus.execute(query);
        return this.mapDTOsFrom(contacts);
    }

    private mapDTOsFrom(contacts: Array<Contact>): Array<ContactDTO> {
        return contacts.map((contact) => ContactDTO.from(contact));
    }
}
