export class Contact {
    constructor(
        protected data: {
            id: string; // <=> userId
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
        return this.data.lastname;
    }
}
