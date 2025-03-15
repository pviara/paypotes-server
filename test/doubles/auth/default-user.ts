import { User } from '@users/domain/user';

export const DEFAULT_USER = new User({
    id: crypto.randomUUID(),
    firstname: 'Pierre',
    lastname: 'Viara',
    phone: '0647854322',
});
