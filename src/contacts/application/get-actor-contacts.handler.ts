import { Contact } from '@contacts/domain/contact';
import { ContactRepository } from '@contacts/persistence/contact.repository';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

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
    constructor(
        @Inject(contactRepositoryToken)
        private contactRepository: ContactRepository,
    ) {}

    async execute(query: GetActorContactsQuery): Promise<Contact[]> {
        const { actorId, pageIndex, search } = query.payload;
        return this.contactRepository.getActorContacts(
            actorId,
            pageIndex,
            search,
        );
    }
}
