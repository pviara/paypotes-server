import { ContactTaskMessenger } from '@infra/contact-task-managers/contact.task-messenger';
import { Spy } from '@test/helpers/spy';
import { User } from '@users/domain/user';

export class ContactTaskMessengerSpy
    extends Spy<ContactTaskMessenger>
    implements ContactTaskMessenger
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
