import { User } from '@users/domain/user';

export const DEFAULT_USER = new User({
    id: crypto.randomUUID(),
    firstname: 'Pierre',
    lastname: 'Viara',
    email: 'pierre.viara@test.com',
    phone: '0647854322',
});
