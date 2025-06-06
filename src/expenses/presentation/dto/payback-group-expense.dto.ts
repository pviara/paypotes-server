import { IsArray, IsUUID } from 'class-validator';

export class PaybackGroupExpenseDTO {
    @IsArray()
    @IsUUID('4', { each: true })
    debtorIds!: Array<string>;
}
