import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { ErrorFilter } from '@app/error-filter';
import {
    ConsoleLogger,
    INestApplication,
    Logger,
    ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { setTimeout } from 'timers/promises';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({ colors: false }),
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new ErrorFilter());
    app.enableShutdownHooks();
    app.enableCors();

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow('APP_PORT');
    await app.listen(port, logListeningOn(port));

    await setTimeout(1000);
    await createSampleUsersInLocalMode(app);
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
                id: 'b714106e-7691-49f9-94c9-86eaea845642',
                firstname: 'Pierre',
                lastname: 'Viara',
                email: 'pierre.viara@outlook.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Pierre+Viara',
            }),
            new User({
                id: '58e99357-c339-41b0-960f-2f2c75d22e29',
                firstname: 'Nadia',
                lastname: 'Benali',
                email: 'nadia.benali@test.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Nadia+Benali',
            }),
            new User({
                id: '2025f04b-42ee-4890-bc4e-f40bdf7c17e5',
                firstname: 'Camille',
                lastname: 'Durand',
                email: 'camille.durand@test.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Camille+Durand',
            }),
            new User({
                id: 'c0a1b378-25e3-4fb4-8c9d-9137d760c53a',
                firstname: 'Youssef',
                lastname: 'Haddad',
                email: 'youssef.haddad@test.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Youssef+Haddad',
            }),
            new User({
                id: '3e0dd2dd-6174-4bfc-852d-ecf55db2319f',
                firstname: 'Élise',
                lastname: 'Moreau',
                email: 'elise.moreau@test.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Elise+Moreau',
            }),
            new User({
                id: '15eb5938-f89d-40da-9401-556b508028bb',
                firstname: 'Karim',
                lastname: 'Bensalem',
                email: 'karim.bensalem@test.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Karim+Bensalem',
            }),
            new User({
                id: '03efcb46-26a5-4f82-bcd7-16d230f46046',
                firstname: 'Sophie',
                lastname: 'Lefèvre',
                email: 'sophie.lefevre@test.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Lefevre',
            }),
        ];

        const userRepo = app.get(UserRepository);
        for (const user of users) {
            const existingUsers = await userRepo.get(user.getId());
            if (existingUsers.length > 0) {
                continue;
            }

            await userRepo?.create(user);
        }
    }
}

function logListeningOn(port: string): () => void {
    return () =>
        new Logger().log(`Listening on port ${port}`, 'NestApplication');
}
