import { User } from '@app/users/domain/user';

export const generateRandomUsers = (): Array<User> => {
    return Array.from({ length: 4 }).map(
        (_, index) =>
            new User({
                id: crypto.randomUUID(),
                firstname: `firstname_${index}`,
                lastname: `lastname_${index}`,
            }),
    );
};
