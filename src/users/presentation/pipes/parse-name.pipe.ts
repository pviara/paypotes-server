import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseNamePipe implements PipeTransform {
    transform(value: string): string {
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(value)) {
            throw new BadRequestException('Invalid name');
        }
        return value;
    }
}
