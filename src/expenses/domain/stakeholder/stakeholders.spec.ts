import { generateRandomMembers } from '@test/helpers/group/utils';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Stakeholders } from '@expenses/domain/stakeholder/stakeholders';

describe('Stakeholders', () => {
    it('should return 0 for each when given balance is 0', () => {
        const dummyMembers = generateRandomMembers();
        const sut = new Stakeholders(dummyMembers, 0);

        const stakeholders = sut.getValue();
        expectAllStakeholdersShareToBe(0, stakeholders);
    });

    it.each([
        [1, 3, 3],
        [1, 4, 4],
        [15, 75, 5],
        [2500, 17500, 7],
    ])(
        'should return %d for each stakeholder when given balance is %d and there are %d group members',
        (share, balance, length) => {
            const dummyMembers = generateRandomMembers({ length });
            const sut = new Stakeholders(dummyMembers, balance);

            const stakeholders = sut.getValue();
            expectAllStakeholdersShareToBe(share, stakeholders);
        },
    );

    it.each([
        [3, 3],
        [4, 4],
        [75, 5],
        [17500, 7],
        [10, 3],
        [11, 3],
    ])('should return integer shares', (balance, length) => {
        const dummyMembers = generateRandomMembers({ length });
        const sut = new Stakeholders(dummyMembers, balance);

        const shares = sut
            .getValue()
            .map((stakeholder) => stakeholder.getShare());

        expectAllSharesToBeIntegers(shares);
    });

    it.each([
        [3, 3],
        [4, 4],
        [75, 5],
        [17500, 7],
        [10, 3],
        [16, 3],
    ])(
        'should return shares that when sumed up equal initial balance',
        (balance, length) => {
            const dummyMembers = generateRandomMembers({ length });
            const sut = new Stakeholders(dummyMembers, balance);

            const stakeholders = sut.getValue();
            const total = calcTotalSharesFrom(stakeholders);

            expect(total).toBe(balance);
        },
    );

    function expectAllStakeholdersShareToBe(
        share: number,
        stakeholders: Array<Stakeholder>,
    ): void {
        const eachStakeholderShareEqualsZero = stakeholders.every(
            (stakeholder) => stakeholder.shareEquals(share),
        );
        expect(eachStakeholderShareEqualsZero).toBe(true);
    }

    function expectAllSharesToBeIntegers(shares: Array<number>): void {
        const areAllIntegers = shares.every(
            (share) => share === Math.floor(share),
        );
        expect(areAllIntegers).toBe(true);
    }

    function calcTotalSharesFrom(stakeholders: Array<Stakeholder>): number {
        const shares = stakeholders.map((stakeholder) =>
            stakeholder.getShare(),
        );

        return shares.reduce((prev, next) => prev + next, 0);
    }
});
