import { User } from '@users/domain/user';

export interface ContactTaskMessenger {
    sendRelationshipMustBeCreatedBetween(
        userA: User,
        userB: User,
    ): Promise<void>;
}

export class RabitMQContactTaskMessenger implements ContactTaskMessenger {
    sendRelationshipMustBeCreatedBetween(
        userA: User,
        userB: User,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
