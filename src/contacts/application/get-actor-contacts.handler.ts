import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

export class GetActorContactsQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorContactsQuery)
export class GetActorContactsHandler
    implements IQueryHandler<GetActorContactsQuery>
{
    constructor(private contactRepository: ContactRepository) {}

    @Log('debug')
    async execute(query: GetActorContactsQuery): Promise<Contact[]> {
        const { actorId, pageIndex, search } = query.payload;
        return this.contactRepository.getActorContacts(
            actorId,
            pageIndex,
            search,
        );
    }
}
