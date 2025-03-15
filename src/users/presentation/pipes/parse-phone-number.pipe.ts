import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParsePhoneNumberPipe implements PipeTransform {
    transform(value: string): string {
        if (!/^(06|07)\d{8}$/.test(value)) {
            throw new BadRequestException('Invalid phone number');
        }
        return value;
    }
}
