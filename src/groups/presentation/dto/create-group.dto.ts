import {
    ArrayMinSize,
    IsArray,
    IsString,
    IsUUID,
    Matches,
    MinLength,
} from 'class-validator';

export class CreateGroupDTO {
    @IsUUID('4')
    id!: string;

    @IsString()
    @MinLength(2)
    name!: string;

    @IsString()
    @Matches(/\p{Emoji}/u)
    emoji!: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    userIds!: Array<string>;
}
