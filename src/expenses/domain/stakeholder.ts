export class Stakeholder {
    constructor(
        private data: {
            id: string; // <=> userId
            firstname: string;
            lastname: string;
        },
    ) {}

    getId(): string {
        return this.data.id;
    }
}
