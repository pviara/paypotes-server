import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('users');
    if (!exists) {
        await knex.schema.createTable('users', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('firstname', 30).notNullable().defaultTo('');
            table.string('lastname', 30).notNullable().defaultTo('');
            table.string('email', 50).notNullable().defaultTo('');
            table.string('avatar_url', 100).notNullable().defaultTo('');
        });

        await knex.raw(`
            alter table users
            add column full_name tsvector
            generated always as (
                to_tsvector('simple', lower(firstname || ' ' || lastname))
            ) stored;
        `);

        await knex.raw(`
            create index users_full_name_gin_index on users using gin(full_name);
        `);
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('users');
    if (exists) {
        return knex.schema.dropTable('users');
    }
}
