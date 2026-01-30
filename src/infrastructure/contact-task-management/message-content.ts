export enum Message {
    GroupCreated = 'groupCreated',
    PairExpenseCreated = 'pairExpenseCreated',
}

type BaseMessageContent = { type: Message; correlationId: string };

type AddRelationshipBetweenUsersMessageContent = BaseMessageContent & {
    userIds: [string, string];
    type: Message.PairExpenseCreated;
};

type AddRelationshipsBetweenUsersMessageContent = BaseMessageContent & {
    userIds: Array<string>;
    type: Message.GroupCreated;
};

export type MessageContent =
    | AddRelationshipBetweenUsersMessageContent
    | AddRelationshipsBetweenUsersMessageContent;
