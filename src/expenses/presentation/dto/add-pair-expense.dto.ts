import { convertCents } from '@expenses/presentation/dto/utils';
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
