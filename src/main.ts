import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger } from '@nestjs/common';
import { ErrorFilter } from '@app/error-filter';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({ colors: false }),
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new ErrorFilter());
    app.enableShutdownHooks();
    app.enableCors();

    await createSampleUsersInLocalMode(app);

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow('APP_PORT');
    await app.listen(port, logListeningOn(port));
}
bootstrap();

async function createSampleUsersInLocalMode(
    app: INestApplication,
): Promise<void> {
    const configService = app.get(ConfigService);
    const environment = configService.getOrThrow('APP_ENVIRONMENT');

    if (environment === 'local') {
        const users = [
            new User({
                id: '6852eafd-5179-46f2-9425-b4938b9eb3c0',
                firstname: 'Peter',
                lastname: 'Parker',
                email: 'peter.parker@test.com',
                avatarUrl:
                    'https://gravatar.com/avatar/6d47aeeb1c5ea9a4f9f7ea7ecc36a721?s=800&d=mp&r=x',
            }),
            new User({
                id: 'b6c614d7-7ac1-4822-b8e1-71c4b71051e1',
                firstname: 'Bruce',
                lastname: 'Wayne',
                email: 'bruce.wayne@test.com',
                avatarUrl:
                    'https://gravatar.com/avatar/6d47aeeb1c5ea9a4f9f7ea7ecc36a721?s=800&d=mp&r=x',
            }),
        ];
        const userRepo = app.get<UserRepository>(userRepositoryToken);
        for (const user of users) await userRepo?.create(user);
    }
}

function logListeningOn(port: string): () => void {
    return () =>
        new Logger().log(`Listening on port ${port}`, 'NestApplication');
}
