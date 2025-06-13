import { User } from '@users/domain/user';

export class UserDTO {
    private constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
        readonly avatarUrl: string,
    ) {}

    static from(user: User): UserDTO {
        return new UserDTO(
            user.getId(),
            user.getFirstname(),
            user.getLastname(),
            user.getAvatarUrl(),
        );
    }
}
