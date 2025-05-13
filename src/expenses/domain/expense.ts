export type Metadata = {
    id: string;
    label: string;
    emoji: string;
};

export abstract class Expense {
    constructor(protected metadata: Metadata) {}

    getId(): string {
        return this.metadata.id;
    }

    getLabel(): string {
        return this.metadata.label;
    }

    getEmoji(): string {
        return this.metadata.emoji;
    }

    abstract getRawBalance(): number;

    abstract hasCreditor(stakeholderId: string): boolean;

    abstract involves(stakeholderId: string): boolean;
}
