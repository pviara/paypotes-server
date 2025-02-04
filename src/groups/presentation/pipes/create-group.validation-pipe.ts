import { PipeTransform } from '@nestjs/common';

export class CreateGroupValidationPipe implements PipeTransform {
    transform(value: unknown): typeof value {
        return value;
    }
}
