type ContentType = 'groupCreated' | 'pairExpenseCreated';

export type MessageContent = {
    data: unknown;
    type: ContentType;
};
