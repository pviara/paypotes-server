import { User } from '@users/domain/user';

export enum MessageType {
    GroupCreated = 'groupCreated',
    PairExpenseCreated = 'pairExpenseCreated',
}

type BaseMessageContent = { type: MessageType };

type AddRelationshipBetweenUsersMessageContent = BaseMessageContent & {
    users: [User, User];
    type: MessageType.PairExpenseCreated;
};

type AddRelationshipsBetweenUsersMessageContent = BaseMessageContent & {
    users: Array<User>;
    type: MessageType.GroupCreated;
};

export type MessageContent =
    | AddRelationshipBetweenUsersMessageContent
    | AddRelationshipsBetweenUsersMessageContent;
