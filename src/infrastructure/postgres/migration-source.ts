import { Knex } from 'knex';
import { readdirSync } from 'fs';
import * as path from 'path';

export class MigrationSource implements Knex.MigrationSource<string> {
    private readonly path = process.env['POSTGRES_MIGRATIONS_PATH'] ?? '';

    getMigration(migration: string): Promise<Knex.Migration> {
        return import(path.join(this.path, migration));
    }

    getMigrationName(migration: string): string {
        return migration;
    }

    async getMigrations(): Promise<string[]> {
        const dirents = readdirSync(this.path, { withFileTypes: true });
        return dirents
            .filter((dirent) => dirent.isFile())
            .filter((dirent) => dirent.name.endsWith('.js'))
            .map((dirent) => dirent.name);
    }
}
