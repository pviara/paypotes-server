import { ContactTaskMessenger } from '@infra/task-messengers/contact.task-messenger';
import { Spy } from '@test/helpers/spy';
import { User } from '@users/domain/user';

export class ContactTaskMessengerSpy
    extends Spy<ContactTaskMessenger>
    implements ContactTaskMessenger
{
    readonly calls = {
        sendRelationshipMustBeCreatedBetween: {
            count: 0,
            history: [] as Array<[User, User]>,
        },
    };

    async sendRelationshipMustBeCreatedBetween(
        userA: User,
        userB: User,
    ): Promise<void> {
        this.saveCall('sendRelationshipMustBeCreatedBetween', [userA, userB]);
        return this.getStubOrDefault(
            'sendRelationshipMustBeCreatedBetween',
            undefined,
        );
    }
}
