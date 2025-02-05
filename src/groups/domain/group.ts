import { User } from '@users/domain/user';

export class Group {
    constructor(
        readonly data: {
            id: string;
            name: string;
            emoji: string;
            members: Array<User>;
        },
    ) {}
}
