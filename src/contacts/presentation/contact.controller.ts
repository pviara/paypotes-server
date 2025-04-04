import { ActorId } from '@test/doubles/auth/actor.decorator';
import { AuthGuard } from '@auth/auth-guard.decorator';
import { Contact } from '@contacts/domain/contact';
import { ContactWithBalanceDTO } from '@app/contacts/presentation/dto/contact-with-balance.dto';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { GetActorContactWithBalanceByIdQuery } from '@app/contacts/application/get-actor-contact-with-balance-by-id.handler';
import { GetActorContactsQuery } from '@contacts/application/get-actor-contacts.handler';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { QueryBus } from '@nestjs/cqrs';
import { Search } from '@app/shared/decorators/search.query-decorator';
import { ContactWithBalance } from '../domain/contact-with-balance';

export const CONTACTS_API_ROUTE = 'contacts';

const ContactId = () => Param('id', ParseUUIDPipe);

@AuthGuard()
@Controller(CONTACTS_API_ROUTE)
export class ContactController {
    constructor(private queryBus: QueryBus) {}

    // @Get(':id')
    // async getActorContactById(
    //     @ActorId() actorId: string,
    //     @ContactId() contactId: string,
    // ): Promise<ContactDTO> {
    //     const query = new GetActorContactWithBalanceByIdQuery({
    //         actorId,
    //         contactId,
    //     });
    //     const contact = await this.queryBus.execute(query);
    //     return ContactDTO.from(contact);
    // }

    @Get(':id/balance')
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

    // @Get()
    // async getActorContacts(
    //     @ActorId() actorId: string,
    //     @PageIndex() pageIndex: number,
    //     @Search() search: string,
    // ): Promise<ContactWithBalanceDTO[]> {
    //     const query = new GetActorContactsQuery({
    //         actorId,
    //         pageIndex,
    //         search,
    //     });
    //     const contacts = await this.queryBus.execute(query);
    //     return this.mapDTOsFrom(contacts);
    // }

    private mapDTOsFrom(
        contacts: Array<ContactWithBalance>,
    ): Array<ContactWithBalanceDTO> {
        return contacts.map((contact) => ContactWithBalanceDTO.from(contact));
    }
}
