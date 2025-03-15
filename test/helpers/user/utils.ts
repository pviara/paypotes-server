import { User } from '@users/domain/user';

export const generateRandomUser = (): User => {
    return new User({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
        phone: '0603497712',
    });
};

export const generateRandomUsers = (): Array<User> => {
    return Array.from({ length: 4 }).map(
        (_, index) =>
            new User({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
                phone: '078452168344',
            }),
    );
};
