import { Stakeholder } from '@expenses/domain/stakeholder';

export type Relationship = {
    creditor: Stakeholder;
    debtor: Stakeholder;
};
