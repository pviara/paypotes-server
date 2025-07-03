import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger } from '@nestjs/common';
import { ErrorFilter } from '@app/error-filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({ colors: false }),
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new ErrorFilter());
    app.enableShutdownHooks();
    app.enableCors();

    const configService = app.get(ConfigService);
    const port = configService.get('APP_PORT');
    await app.listen(port, logListeningOn(port));
}
bootstrap();

function logListeningOn(port: string): () => void {
    return () =>
        new Logger().log(`Listening on port ${port}`, 'NestApplication');
}
