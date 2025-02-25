import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { contactRepositoryToken } from '../persistence/contact.repository-provider';
import { ContactRepository } from '../persistence/contact.repository';
import { Contact } from '../domain/contact';

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
        const group = await this.contactRepository.getActorContactById(
            actorId,
            contactId,
        );

        if (group) return group;
        throw new ContactNotFoundError(contactId);
    }
}

export class ContactNotFoundError extends Error {
    constructor(id: string) {
        super(`Contact with id '${id}' cannot be found`);
    }
}
