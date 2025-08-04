import { Knex } from 'knex';

const TABLE_NAME = 'users';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (!exists) {
        return knex.schema.createTable(TABLE_NAME, (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('firstname', 30).notNullable().defaultTo('');
            table.string('lastname', 30).notNullable().defaultTo('');
            table.string('email', 50).notNullable().defaultTo('');
            table.string('avatar_url', 100).notNullable().defaultTo('');
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (exists) {
        return knex.schema.dropTable(TABLE_NAME);
    }
}
