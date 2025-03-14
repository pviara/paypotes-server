import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorFilter } from '@app/error-filter';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ErrorFilter());

    await app.listen(process.env.PORT ?? 7001);
}
bootstrap();
