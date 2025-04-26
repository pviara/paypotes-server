import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { ErrorFilter } from '@app/error-filter';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ErrorFilter());
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);
    const port = configService.get('APP_PORT');

    await app.listen(port);
}
bootstrap();
