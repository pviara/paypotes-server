import { BadRequestException } from '@nestjs/common';

export const convertCents = (): ((options: { value: unknown }) => number) => {
    return ({ value }: { value: unknown }) => {
        if (typeof value !== 'string') {
            throw new BadRequestException('Given balance is not a string');
        }

        const normalized = value.replace(',', '.');
        const float = parseFloat(normalized);
        if (isNaN(float)) {
            throw new BadRequestException(
                'Given balance cannot be cast as number',
            );
        }

        return Math.round(float * 100);
    };
};
