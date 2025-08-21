import { Application } from '@test/helpers/application/application';
import { AsyncCallback } from '@test/helpers/types';
import { Person } from '@expenses/domain/stakeholder/stakeholder';

export const empty = (application: Application): AsyncCallback<void> => {
    return async (): Promise<void> => await application.emptyDatabase();
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
