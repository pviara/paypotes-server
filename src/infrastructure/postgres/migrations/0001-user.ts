import { Knex } from 'knex';

const TABLE_NAME = 'users';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (!exists) {
        await knex.schema.createTable(TABLE_NAME, (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('firstname', 30).notNullable().defaultTo('');
            table.string('lastname', 30).notNullable().defaultTo('');
            table.string('email', 50).notNullable().defaultTo('');
            table.string('avatar_url', 100).notNullable().defaultTo('');
        });

        await knex.raw(`
            alter table ${TABLE_NAME}
            add column full_name tsvector
            generated always as (
                to_tsvector('simple', lower(firstname || ' ' || lastname))
            ) stored;
        `);

        await knex.raw(`
            create index users_full_name_gin_index on ${TABLE_NAME} using gin(full_name);
        `);
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (exists) {
        return knex.schema.dropTable(TABLE_NAME);
    }
}
