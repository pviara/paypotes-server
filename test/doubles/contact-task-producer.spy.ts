import { ContactTaskProducer } from '@infra/contact-task-management/contact.task-producer';
import { Spy } from '@test/helpers/spy';

export class ContactTaskProducerSpy
    extends Spy<ContactTaskProducer>
    implements ContactTaskProducer
{
    readonly calls = {
        sendRelationshipMustBeCreatedBetween: {
            count: 0,
            history: [] as Array<[string, string]>,
        },
        sendRelationshipsMustBeCreatedBetween: {
            count: 0,
            history: [] as Array<string[]>,
        },
    };

    async sendRelationshipMustBeCreatedBetween(
        userIdA: string,
        userIdB: string,
    ): Promise<void> {
        this.saveCall('sendRelationshipMustBeCreatedBetween', [
            userIdA,
            userIdB,
        ]);
        return this.getStubOrDefault(
            'sendRelationshipMustBeCreatedBetween',
            undefined,
        );
    }

    async sendRelationshipsMustBeCreatedBetween(
        userIds: Array<string>,
    ): Promise<void> {
        this.saveCall('sendRelationshipsMustBeCreatedBetween', userIds);
        return this.getStubOrDefault(
            'sendRelationshipsMustBeCreatedBetween',
            undefined,
        );
    }
}
