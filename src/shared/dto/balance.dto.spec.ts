import { BalanceDTO } from '@app/shared/dto/balance.dto';

describe('BalanceDTO', () => {
    it.each([
        [0, '0,00'],
        [1, '0,01'],
        [30, '0,30'],
        [271, '2,71'],
        [1000, '10,00'],
        [12000, '120,00'],
    ])(
        'should correctly format given balance %s to %s',
        (balance, expected) => {
            expect(BalanceDTO.from(balance).getValue()).toBe(expected);
        },
    );
});
