import { Stakeholder } from '@expenses/domain/stakeholder';
import { BalanceDTO } from '@app/shared/dto/balance.dto';

export class StakeholderDTO {
    constructor(
        readonly id: string,
        readonly firstname: string,
        readonly lastname: string,
        readonly avatarUrl: string,
        readonly share: string,
    ) {}

    static from(stakeholder: Stakeholder): StakeholderDTO {
        const share = BalanceDTO.from(stakeholder.getShare());
        return new StakeholderDTO(
            stakeholder.getId(),
            stakeholder.getFirstname(),
            stakeholder.getLastname(),
            stakeholder.getAvatarUrl(),
            share.getValue(),
        );
    }
}

export type StakeholderDTOs = Array<StakeholderDTO>;
