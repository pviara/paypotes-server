import { Application } from '@test/helpers/application/application';
import { AsyncCallback } from '@test/helpers/types';
import { INestApplication } from '@nestjs/common';
import { Person } from '@expenses/domain/stakeholder/stakeholder';

export const bootstrap = (
    application: Application,
): AsyncCallback<INestApplication> => {
    return async (): Promise<INestApplication> => await application.bootstrap();
};

export const shutdown = (application: Application): AsyncCallback<void> => {
    return async (): Promise<void> => await application.shutdown();
};

export const mapIdsFrom = (persons: Array<Person>): Array<string> => {
    return persons.map((person) => person.getId());
};

export const raw = (obj: unknown): unknown => {
    return JSON.parse(JSON.stringify(obj));
};

export const convertCents = (balance: number): number => {
    return balance / 100;
};
