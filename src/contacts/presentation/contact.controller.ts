import { ActorId } from '@test/doubles/auth/actor.decorator';
import { AuthGuard } from '@auth/auth-guard.decorator';
import { Contact } from '@contacts/domain/contact';
import { ContactDTO } from './dto/contact.dto';
import { ContactWithBalance } from '@contacts/domain/contact-with-balance';
import { ContactWithBalanceDTO } from '@contacts/presentation/dto/contact-with-balance.dto';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { GetActorContactsQuery } from '@contacts/application/get-actor-contacts.handler';
import { GetActorContactsWithBalanceQuery } from '@contacts/application/get-actor-contacts-with-balance.handler';
import { GetActorContactWithBalanceByIdQuery } from '@contacts/application/get-actor-contact-with-balance-by-id.handler';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { QueryBus } from '@nestjs/cqrs';
import { Search } from '@app/shared/decorators/search.query-decorator';

export const CONTACTS_API_ROUTE = 'contacts';

const ContactId = () => Param('id', ParseUUIDPipe);

@AuthGuard()
@Controller(CONTACTS_API_ROUTE)
export class ContactController {
    constructor(private queryBus: QueryBus) {}

    @Get('without-balance')
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
        return this.mapContactDTOsFrom(contacts);
    }

    @Get(':id')
    async getActorContactWithBalanceById(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
    ): Promise<ContactWithBalanceDTO> {
        const query = new GetActorContactWithBalanceByIdQuery({
            actorId,
            contactId,
        });
        const contact = await this.queryBus.execute(query);
        return ContactWithBalanceDTO.from(contact);
    }

    @Get()
    async getActorContactsWithBalance(
        @ActorId() actorId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<ContactWithBalanceDTO[]> {
        const query = new GetActorContactsWithBalanceQuery({
            actorId,
            pageIndex,
            search,
        });
        const contacts = await this.queryBus.execute(query);
        return this.mapContactWithBalanceDTOsFrom(contacts);
    }

    private mapContactDTOsFrom(contacts: Array<Contact>): Array<ContactDTO> {
        return contacts.map((contact) => ContactDTO.from(contact));
    }

    private mapContactWithBalanceDTOsFrom(
        contacts: Array<ContactWithBalance>,
    ): Array<ContactWithBalanceDTO> {
        return contacts.map((contact) => ContactWithBalanceDTO.from(contact));
    }
}
