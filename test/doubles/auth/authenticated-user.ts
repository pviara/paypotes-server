import { User } from '@users/domain/user';

export const AUTHENTICATED_USER = new User({
    id: crypto.randomUUID(),
    firstname: 'Pierre',
    lastname: 'Viara',
});
