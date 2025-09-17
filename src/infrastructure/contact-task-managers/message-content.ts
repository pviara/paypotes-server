export enum MessageType {
    GroupCreated = 'groupCreated',
    PairExpenseCreated = 'pairExpenseCreated',
}

type BaseMessageContent = { type: MessageType; correlationId: string };

type AddRelationshipBetweenUsersMessageContent = BaseMessageContent & {
    userIds: [string, string];
    type: MessageType.PairExpenseCreated;
};

type AddRelationshipsBetweenUsersMessageContent = BaseMessageContent & {
    userIds: Array<string>;
    type: MessageType.GroupCreated;
};

export type MessageContent =
    | AddRelationshipBetweenUsersMessageContent
    | AddRelationshipsBetweenUsersMessageContent;
