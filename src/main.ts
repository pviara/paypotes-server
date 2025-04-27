import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { ErrorFilter } from '@app/error-filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/persistence/user.repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new ErrorFilter());
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);

    const environment = configService.get('APP_ENVIRONMENT');
    if (environment === 'local') {
        const users = [
            new User({
                id: '6852eafd-5179-46f2-9425-b4938b9eb3c0',
                firstname: 'Peter',
                lastname: 'Parker',
                email: 'peter.parker@test.com',
                phone: '0647859630',
            }),
            new User({
                id: 'b6c614d7-7ac1-4822-b8e1-71c4b71051e1',
                firstname: 'Bruce',
                lastname: 'Wayne',
                email: 'bruce.wayne@test.com',
                phone: '0712345678',
            }),
            new User({
                id: 'b714106e-7691-49f9-94c9-86eaea845642',
                firstname: 'Clark',
                lastname: 'Kent',
                email: 'clark.kent@test.com',
                phone: '0698765432',
            }),
        ];
        const userRepo = app.get<UserRepository>(userRepositoryToken);
        for (const user of users) await userRepo?.create(user);
    }

    const port = configService.get('APP_PORT');
    await app.listen(port, logListeningOn(port));
}
bootstrap();

function logListeningOn(port: string): () => void {
    return () =>
        new Logger().verbose(`Listening on port ${port}`, 'NestApplication');
}
