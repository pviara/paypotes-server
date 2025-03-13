import { BadRequestException } from '@nestjs/common';
import { IsBoolean, IsString, IsUUID, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddPairExpenseDTO {
    @IsUUID('4')
    id!: string;

    @IsString()
    label!: string;

    @IsString()
    @Matches(/\p{Emoji}/u)
    emoji!: string;

    @Transform(convertCents())
    balance!: number;

    @IsBoolean()
    isCurrentPayer!: boolean;

    @IsUUID('4')
    userId!: string;
}

function convertCents(): (options: { value: unknown }) => number {
    return ({ value }: { value: unknown }) => {
        if (typeof value !== 'string') {
            throw new BadRequestException('Given balance is not a string');
        }
        const normalized = value.replace(',', '.');
        return Math.round(parseFloat(normalized) * 100);
    };
}
