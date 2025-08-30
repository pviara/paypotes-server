import { AddPairExpenseDTO } from '@expenses/presentation/dto/add-pair-expense.dto';
import { PipeTransform } from '@nestjs/common';

export class TransformBalancePipe implements PipeTransform {
    transform(value: AddPairExpenseDTO): AddPairExpenseDTO {
        return {
            ...value,
            balance: +`${value.balance}`.replace(',', ''),
        };
    }
}
