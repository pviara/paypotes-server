import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorFilter } from '@app/error-filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ErrorFilter());

    const configService = app.get(ConfigService);
    const port = configService.get('APP_PORT');

    await app.listen(port);
}
bootstrap();
