import { generateRandomMembers } from '@test/helpers/group/utils';
import { generateRandomUser } from '@test/helpers/user/utils';
import { Member } from '@groups/domain/member';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholder/stakeholders';
import { User } from '@users/domain/user';

describe('Stakeholders', () => {
    const dummyCreditor = generateRandomUser();

    it('should return 0 for each stakeholder when given balance is 0', () => {
        const dummyDebtors = generateRandomMembers();
        const stakeholders = Stakeholders.create({
            balance: 0,
            creditor: dummyCreditor,
            debtors: dummyDebtors,
        });

        expectAllStakeholdersShareToBe(0, stakeholders);
    });

    it.each([
        [3, 3],
        [4, 4],
        [75, 5],
        [17500, 7],
        [10, 3],
        [11, 3],
    ])('should return only integer shares', (balance, length) => {
        const dummyDebtors = generateRandomMembers({ length });
        const stakeholders = Stakeholders.create({
            balance,
            creditor: dummyCreditor,
            debtors: dummyDebtors,
        });

        const shares = stakeholders.map((stakeholder) =>
            stakeholder.getShare(),
        );

        expectAllSharesToBeIntegers(shares);
    });

    it('should return the right share for the two only stakeholders', () => {
        const dummyBalance = 1200;
        const dummyDebtor = generateRandomUser();
        const stakeholders = Stakeholders.create({
            balance: dummyBalance,
            creditor: dummyCreditor,
            debtors: [dummyDebtor],
        });

        const shares = stakeholders.map((stakeholder) =>
            stakeholder.getShare(),
        );

        const expectedShare = 600;
        expect(shares).toStrictEqual([expectedShare, expectedShare]);
    });

    it('should return the right shares for both creditor and debtors', () => {
        const dummyBalance = 3000;
        const dummyCreditor = generateRandomUser();
        const dummyDebtors = generateRandomMembers({ length: 3 });
        const stakeholders = Stakeholders.create({
            balance: dummyBalance,
            creditor: dummyCreditor,
            debtors: dummyDebtors,
        });

        const expectedCreditorShare = 2250;
        const creditorStakeholder = getStakeholderProfileFrom(
            stakeholders,
            dummyCreditor,
        );
        expect(creditorStakeholder.getShare()).toBe(expectedCreditorShare);

        const expectedDebtorShare = 750;
        const debtorStakeholders = getStakeholderProfilesFrom(
            stakeholders,
            dummyDebtors,
        );
        expectAllStakeholdersShareToBe(expectedDebtorShare, debtorStakeholders);
    });

    function expectAllStakeholdersShareToBe(
        share: number,
        stakeholders: Array<Stakeholder>,
    ): void {
        const eachStakeholderShareEqualsShare = stakeholders.every(
            (stakeholder) => stakeholder.getShare() === share,
        );
        expect(eachStakeholderShareEqualsShare).toBe(true);
    }

    function expectAllSharesToBeIntegers(shares: Array<number>): void {
        const areAllIntegers = shares.every(
            (share) => share === Math.floor(share),
        );
        expect(areAllIntegers).toBe(true);
    }

    function getStakeholderProfileFrom(
        stakeholders: Array<Stakeholder>,
        dummyCreditor: User,
    ): Stakeholder {
        const stakeholder = stakeholders.find(
            (stakeholder) => stakeholder.getId() === dummyCreditor.getId(),
        );
        if (stakeholder) return stakeholder;
        throw new Error(
            'Stakeholder profile cannot be found, thus tests cannot run.',
        );
    }

    function getStakeholderProfilesFrom(
        stakeholders: Array<Stakeholder>,
        dummyDebtors: Array<Member>,
    ): Array<Stakeholder> {
        return stakeholders.filter((stakeholder) =>
            dummyDebtors.some((d) => d.getId() === stakeholder.getId()),
        );
    }
});
