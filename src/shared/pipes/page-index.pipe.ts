import { PipeTransform } from '@nestjs/common';

export class PageIndexPipe implements PipeTransform {
    transform(value: any) {
        const casted = +value;
        return isNaN(casted) ? 0 : casted;
    }
}
