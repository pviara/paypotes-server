import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { ContactWithBalance } from '@contacts/domain/contact-with-balance';

export class ContactWithBalanceDTO {
    private constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
        readonly avatarUrl: string,
        readonly balance: string,
    ) {}

    static from(contact: ContactWithBalance): ContactWithBalanceDTO {
        const balance = BalanceDTO.from(contact.getBalance());
        return new ContactWithBalanceDTO(
            contact.getId(),
            contact.getFirstname(),
            contact.getLastname(),
            contact.getAvatarUrl(),
            balance.getValue(),
        );
    }
}
