import { Knex } from 'knex';
import { readdirSync } from 'fs';
import * as path from 'path';

export class MigrationSource implements Knex.MigrationSource<string> {
    private path = path.resolve(
        __dirname,
        '../../infrastructure/postgres/migrations',
    );

    async getMigration(migration: string): Promise<Knex.Migration> {
        return await import(path.join(this.path, migration));
    }

    getMigrationName(migration: string): string {
        return migration;
    }

    async getMigrations(): Promise<string[]> {
        const dirents = readdirSync(this.path, { withFileTypes: true });
        console.log('dirs', dirents);
        return dirents
            .filter((directory) => directory.isFile())
            .map((directory) => directory.name);
    }
}
