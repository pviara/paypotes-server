import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Contact } from '@contacts/domain/contact';
import { contactRepositoryToken } from '@contacts/persistence/contact.repository-provider';
import { ContactRepository } from '@contacts/persistence/contact.repository';

export class GetActorContactByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            contactId: string;
        },
    ) {}
}

@QueryHandler(GetActorContactByIdQuery)
export class GetActorContactByIdHandler
    implements IQueryHandler<GetActorContactByIdQuery>
{
    constructor(
        @Inject(contactRepositoryToken)
        private contactRepository: ContactRepository,
    ) {}

    async execute(query: GetActorContactByIdQuery): Promise<Contact> {
        const { actorId, contactId } = query.payload;
        const contact = await this.contactRepository.getActorContactById(
            actorId,
            contactId,
        );

        if (contact) return contact;
        throw new ContactNotFoundError(contactId);
    }
}

export class ContactNotFoundError extends Error {
    constructor(id: string) {
        super(`Contact with id '${id}' cannot be found`);
    }
}
