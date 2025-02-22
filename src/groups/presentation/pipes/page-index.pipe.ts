import { PipeTransform } from '@nestjs/common';

export class PageIndexPipe implements PipeTransform {
    transform(value: any) {
        return +value || 0;
    }
}
