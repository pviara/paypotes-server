import { BadRequestException } from '@nestjs/common';

export const convertCents = (): ((options: { value: unknown }) => number) => {
    return ({ value }: { value: unknown }) => {
        if (typeof value !== 'string') {
            throw new BadRequestException('Given balance is not a string');
        }
        const normalized = value.replace(',', '.');
        return Math.round(parseFloat(normalized) * 100);
    };
};
