export type Metadata = {
    id: string;
    label: string;
    emoji: string;
};

export abstract class Expense {
    constructor(private metadata: Metadata) {}

    getId(): string {
        return this.metadata.id;
    }

    getLabel(): string {
        return this.metadata.label;
    }

    getEmoji(): string {
        return this.metadata.emoji;
    }

    abstract involves(stakeholderId: string): boolean;
}
