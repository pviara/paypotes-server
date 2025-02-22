import { PipeTransform } from '@nestjs/common';

export class CustomParseIntPipe implements PipeTransform {
    transform(value: any) {
        return +value || 0;
    }
}
