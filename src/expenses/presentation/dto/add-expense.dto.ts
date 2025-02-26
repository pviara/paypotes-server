import { IsBoolean, IsString, IsUUID, Matches } from 'class-validator';

export class AddExpenseDTO {
    @IsString()
    balance!: string;

    @IsString()
    @Matches(/\p{Emoji}/u)
    emoji!: string;

    @IsBoolean()
    isCurrentPayer!: boolean;

    @IsString()
    name!: string;

    @IsUUID('4')
    userId!: string;
}
