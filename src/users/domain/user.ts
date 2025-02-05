export class User {
    constructor(
        private data: {
            id: string;
            firstname: string;
            lastname: string;
        },
    ) {}

    getId(): string {
        return this.data.id;
    }
}
