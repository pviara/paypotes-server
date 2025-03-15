export class User {
    constructor(
        private data: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            phone: string;
        },
    ) {}

    getId(): string {
        return this.data.id;
    }

    getEmail() {
        return this.data.email;
    }

    getFirstname(): string {
        return this.data.firstname;
    }

    getLastname(): string {
        return this.data.lastname;
    }

    getPhone() {
        return this.data.phone;
    }
}
