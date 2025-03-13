import { convertCents } from '@expenses/presentation/dto/utils';
import { IsString, IsUUID, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddGroupExpenseDTO {
    @IsUUID('4')
    id!: string;

    @IsString()
    label!: string;

    @IsString()
    @Matches(/\p{Emoji}/u)
    emoji!: string;

    @Transform(convertCents())
    balance!: number;

    @IsUUID('4')
    groupId!: string;

    @IsUUID('4')
    memberId!: string;
}
