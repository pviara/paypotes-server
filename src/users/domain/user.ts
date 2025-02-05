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

    getFirstname(): string {
        return this.data.firstname;
    }

    getLastname(): string {
        return this.data.firstname;
    }
}
