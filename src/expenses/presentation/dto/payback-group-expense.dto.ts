import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class PaybackGroupExpenseDTO {
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    debtorIds!: Array<string>;
}
