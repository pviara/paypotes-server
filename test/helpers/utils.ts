import { Application } from '@test/helpers/application/application';
import { AsyncCallback } from '@test/helpers/types';
import { Contact } from '@contacts/domain/contact';
import { Group } from '@groups/domain/group';
import { INestApplication } from '@nestjs/common';
import { User } from '@users/domain/user';

export const bootstrap = (
    runner: Application,
): AsyncCallback<INestApplication> => {
    return async (): Promise<INestApplication> => await runner.bootstrap();
};

export const shutdown = (runner: Application): AsyncCallback<void> => {
    return async (): Promise<void> => await runner.shutdown();
};

export const mapIdsFrom = (
    persons: Array<Contact | Group | User>,
): Array<string> => {
    return persons.map((person) => person.getId());
};

export const raw = (obj: unknown): unknown => {
    return JSON.parse(JSON.stringify(obj));
};

export const convertCents = (balance: number): number => {
    return balance / 100;
};
