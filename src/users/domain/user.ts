export class User {
    constructor(
        private data: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            avatarUrl: string;
        },
    ) {}

    getAvatarUrl(): string {
        return this.data.avatarUrl;
    }

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
}
