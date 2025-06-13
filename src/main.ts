import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ErrorFilter } from '@app/error-filter';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new ErrorFilter());
    app.enableShutdownHooks();

    await createSampleUsersInLocalMode(app);

    const configService = app.get(ConfigService);
    const port = configService.get('APP_PORT');
    await app.listen(port, logListeningOn(port));
}
bootstrap();

async function createSampleUsersInLocalMode(
    app: INestApplication,
): Promise<void> {
    const configService = app.get(ConfigService);
    const environment = configService.get('APP_ENVIRONMENT');
    if (environment === 'local') {
        const users = [
            new User({
                id: '6852eafd-5179-46f2-9425-b4938b9eb3c0',
                firstname: 'Peter',
                lastname: 'Parker',
                email: 'peter.parker@test.com',
            }),
            new User({
                id: 'b6c614d7-7ac1-4822-b8e1-71c4b71051e1',
                firstname: 'Bruce',
                lastname: 'Wayne',
                email: 'bruce.wayne@test.com',
            }),
            new User({
                id: DEFAULT_USER.getId(),
                firstname: 'Clark',
                lastname: 'Kent',
                email: 'clark.kent@test.com',
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
