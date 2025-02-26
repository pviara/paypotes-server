import { PipeTransform } from '@nestjs/common';

export class SearchPipe implements PipeTransform {
    transform(value: any) {
        return value || '';
    }
}
